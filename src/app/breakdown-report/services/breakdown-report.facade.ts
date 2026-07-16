import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, from, of } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';
import { CameraService } from '../../core/camera/camera.service';
import { BreakdownOfflineSyncService } from '../../core/breakdowns/offline/breakdown-offline-sync.service';
import type { RegisterBreakdownResult } from '../../core/breakdowns/offline/breakdown-offline.model';
import { BREAKDOWN_MESSAGES } from '../../core/constants/ui-messages.constants';
import { BreakdownService } from '../../core/firebase/breakdown.service';
import type { Breakdown, BreakdownCategory, BreakdownPhotoEvidence, BreakdownVideoEvidence, Priority } from '../../core/models/breakdown.model';
import { BreakdownPhotoSerializer } from '../../core/utils/breakdown-photo.serializer';
import { BreakdownVideoSerializer } from '../../core/utils/breakdown-video.serializer';
import { mapFormToBreakdown } from '../../core/utils/mappers.util';
import { isValidFileSize, isValidImageFile, isValidVideoFile, validateBreakdownForm } from '../../core/utils/validators.util';

@Injectable()
export class BreakdownReportFacade {
  private readonly selectedPhoto$ = new BehaviorSubject<File | null>(null);
  private readonly selectedVideo$ = new BehaviorSubject<File | null>(null);
  private readonly isLoading$ = new BehaviorSubject<boolean>(false);
  private readonly errorMessage$ = new BehaviorSubject<string>('');
  private readonly successMessage$ = new BehaviorSubject<string>('');

  readonly photo$ = this.selectedPhoto$.asObservable();
  readonly video$ = this.selectedVideo$.asObservable();
  readonly isLoading = this.isLoading$.asObservable();
  readonly error$ = this.errorMessage$.asObservable();
  readonly success$ = this.successMessage$.asObservable();

  private readonly breakdownService = inject(BreakdownService);
  private readonly breakdownSyncService = inject(BreakdownOfflineSyncService);
  private readonly cameraService = inject(CameraService);
  private readonly photoSerializer = inject(BreakdownPhotoSerializer);
  private readonly videoSerializer = inject(BreakdownVideoSerializer);

  takePhoto(): Observable<File | null> {
    this.setLoading(true);
    this.clearMessages();

    return this.cameraService.takePhoto('averia').pipe(
      tap((photo) => this.validateAndSetPhoto(photo)),
      catchError((error: Error) => {
        this.setError(error.message);
        return of(null);
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  pickPhotoFromGallery(): Observable<File | null> {
    this.setLoading(true);
    this.clearMessages();

    return this.cameraService.pickPhotoFromGallery('averia').pipe(
      tap((photo) => this.validateAndSetPhoto(photo)),
      catchError((error: Error) => {
        this.setError(error.message);
        return of(null);
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  setPhoto(photo: File): boolean {
    this.clearMessages();
    return this.validateAndSetPhoto(photo);
  }

  setVideo(video: File): boolean {
    this.clearMessages();
    return this.validateAndSetVideo(video);
  }

  submitBreakdownReport(
    category: BreakdownCategory,
    description: string,
    priority: Priority,
    location: string,
  ): Observable<Breakdown | null> {
    const validation = validateBreakdownForm(category, description, location);

    if (!validation.isValid) {
      this.setError(Object.values(validation.errors).join(', '));
      return of(null);
    }

    this.setLoading(true);
    this.clearMessages();

    const breakdownId = this.breakdownService.createDocumentId();
    const breakdown = mapFormToBreakdown({
      category,
      description,
      priority,
      location,
    });
    const selectedPhoto = this.selectedPhoto$.value;
    const selectedVideo = this.selectedVideo$.value;
    const evidenceRequest: Observable<BreakdownPhotoEvidence | null> = selectedPhoto ? from(this.photoSerializer.serialize(selectedPhoto)) : of(null);

    return evidenceRequest.pipe(
      switchMap((photoEvidence) => this.videoEvidenceRequest(selectedVideo).pipe(
        switchMap((videoEvidence) => this.breakdownSyncService.register(
          this.withEvidence(breakdown, photoEvidence, videoEvidence),
          breakdownId,
        )),
      )),
      tap((result) => {
        this.setSuccess(this.successMessage(result));
        this.clearEvidence();
      }),
      map((result) => result.breakdown),
      catchError((error: Error) => {
        this.setError(error.message || BREAKDOWN_MESSAGES.registerError);
        return of(null);
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  clearPhoto(): void {
    this.selectedPhoto$.next(null);
  }

  clearVideo(): void {
    this.selectedVideo$.next(null);
  }

  clearEvidence(): void {
    this.clearPhoto();
    this.clearVideo();
  }

  getPhoto(): File | null {
    return this.selectedPhoto$.value;
  }

  getVideo(): File | null {
    return this.selectedVideo$.value;
  }

  private videoEvidenceRequest(video: File | null): Observable<BreakdownVideoEvidence | null> {
    return video ? from(this.videoSerializer.serialize(video)) : of(null);
  }

  private withEvidence(
    breakdown: Breakdown,
    photoEvidence: BreakdownPhotoEvidence | null,
    videoEvidence: BreakdownVideoEvidence | null,
  ): Breakdown {
    return {
      ...breakdown,
      ...(photoEvidence ? {
        photoDataUrl: photoEvidence.dataUrl,
        photoName: photoEvidence.name,
        photoContentType: photoEvidence.contentType,
      } : {}),
      ...(videoEvidence ? {
        videoDataUrl: videoEvidence.dataUrl,
        videoName: videoEvidence.name,
        videoContentType: videoEvidence.contentType,
      } : {}),
    };
  }

  private validateAndSetVideo(video: File): boolean {
    if (!isValidVideoFile(video)) {
      this.setError('El archivo debe ser un video MP4, WebM o MOV');
      return false;
    }

    if (!isValidFileSize(video, 1)) {
      this.setError('El video debe ser menor a 1MB para adjuntarlo al reporte');
      return false;
    }

    this.selectedVideo$.next(video);
    this.clearMessages();
    return true;
  }

  private successMessage(_result: RegisterBreakdownResult): string {
    return BREAKDOWN_MESSAGES.registerSuccess;
  }

  private validateAndSetPhoto(photo: File): boolean {
    if (!isValidImageFile(photo)) {
      this.setError('El archivo debe ser una imagen JPEG, PNG, WebP o GIF');
      return false;
    }

    if (!isValidFileSize(photo)) {
      this.setError('La imagen debe ser menor a 5MB');
      return false;
    }

    this.selectedPhoto$.next(photo);
    this.clearMessages();
    return true;
  }

  private setLoading(isLoading: boolean): void {
    this.isLoading$.next(isLoading);
  }

  private setError(message: string): void {
    this.errorMessage$.next(message);
  }

  private setSuccess(message: string): void {
    this.successMessage$.next(message);
  }

  private clearMessages(): void {
    this.errorMessage$.next('');
    this.successMessage$.next('');
  }
}
