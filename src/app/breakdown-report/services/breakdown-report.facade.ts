import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, from, of } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { CameraService } from '../../core/camera/camera.service';
import { BreakdownService } from '../../core/firebase/breakdown.service';
import type { Breakdown, BreakdownCategory, BreakdownPhotoEvidence, Priority } from '../../core/models/breakdown.model';
import { BreakdownPhotoSerializer } from '../../core/utils/breakdown-photo.serializer';
import { mapFormToBreakdown } from '../../core/utils/mappers.util';
import { isValidFileSize, isValidImageFile, validateBreakdownForm } from '../../core/utils/validators.util';

@Injectable()
export class BreakdownReportFacade {
  private readonly selectedPhoto$ = new BehaviorSubject<File | null>(null);
  private readonly isLoading$ = new BehaviorSubject<boolean>(false);
  private readonly errorMessage$ = new BehaviorSubject<string>('');
  private readonly successMessage$ = new BehaviorSubject<string>('');

  readonly photo$ = this.selectedPhoto$.asObservable();
  readonly isLoading = this.isLoading$.asObservable();
  readonly error$ = this.errorMessage$.asObservable();
  readonly success$ = this.successMessage$.asObservable();

  private readonly breakdownService = inject(BreakdownService);
  private readonly cameraService = inject(CameraService);
  private readonly photoSerializer = inject(BreakdownPhotoSerializer);

  takePhoto(): Observable<File | null> {
    this.setLoading(true);
    this.clearMessages();

    return this.cameraService.takePhoto().pipe(
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

    return this.cameraService.pickPhotoFromGallery().pipe(
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
    const evidenceRequest: Observable<BreakdownPhotoEvidence | null> = selectedPhoto ? from(this.photoSerializer.serialize(selectedPhoto)) : of(null);

    return evidenceRequest.pipe(
      switchMap((evidence) => this.breakdownService.createBreakdown(this.withEvidence(breakdown, evidence), breakdownId)),
      tap(() => {
        this.setSuccess('Averia registrada exitosamente');
        this.clearPhoto();
      }),
      catchError((error: Error) => {
        this.setError(error.message || 'No se pudo registrar la averia');
        return of(null);
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  clearPhoto(): void {
    this.selectedPhoto$.next(null);
  }

  getPhoto(): File | null {
    return this.selectedPhoto$.value;
  }

  private withEvidence(breakdown: Breakdown, evidence: BreakdownPhotoEvidence | null): Breakdown {
    if (!evidence) {
      return breakdown;
    }

    return {
      ...breakdown,
      photoDataUrl: evidence.dataUrl,
      photoName: evidence.name,
      photoContentType: evidence.contentType,
    };
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
