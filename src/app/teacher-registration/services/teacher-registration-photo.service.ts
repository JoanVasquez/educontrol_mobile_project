import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CameraService } from '../../core/camera/camera.service';
import type { SerializedTeacherPhoto } from '../../core/teachers/teacher-registration.model';
import { DataUrlFileSerializer } from '../../core/teachers/utils/data-url-file.serializer';
import { isValidFileSize, isValidImageFile } from '../../core/utils/validators.util';

const TEACHER_PHOTO_MAX_MB = 1.5;

@Injectable({ providedIn: 'root' })
export class TeacherRegistrationPhotoService {
  private readonly cameraService = inject(CameraService);
  private readonly fileSerializer = new DataUrlFileSerializer();
  private selectedPhoto: File | null = null;
  private objectUrl = '';

  readonly photoName = signal('');
  readonly photoPreviewUrl = signal('');

  get photo(): File | null {
    return this.selectedPhoto;
  }

  async takePhoto(onError: (message: string) => void): Promise<void> {
    await this.selectPhotoFromSource(() => firstValueFrom(this.cameraService.takePhoto('docente')), onError);
  }

  async pickPhotoFromGallery(onError: (message: string) => void): Promise<void> {
    await this.selectPhotoFromSource(() => firstValueFrom(this.cameraService.pickPhotoFromGallery('docente')), onError);
  }

  setPhoto(file: File, onError: (message: string) => void): boolean {
    if (!isValidImageFile(file)) {
      onError('Selecciona una imagen JPEG, PNG, WebP o GIF.');
      return false;
    }

    if (!isValidFileSize(file, TEACHER_PHOTO_MAX_MB)) {
      onError('La foto debe pesar menos de 1.5 MB.');
      return false;
    }

    this.selectedPhoto = file;
    this.photoName.set(file.name);
    this.setPreview(file);
    return true;
  }

  async serializedPhoto(): Promise<SerializedTeacherPhoto | null> {
    return this.selectedPhoto ? this.fileSerializer.fromFile(this.selectedPhoto) : null;
  }

  reset(): void {
    this.selectedPhoto = null;
    this.photoName.set('');
    this.revokeObjectUrl();
    this.photoPreviewUrl.set('');
  }

  revokeObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = '';
    }
  }

  private async selectPhotoFromSource(source: () => Promise<File>, onError: (message: string) => void): Promise<void> {
    try {
      this.setPhoto(await source(), onError);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'No se pudo seleccionar la foto.';
      if (!message.toLowerCase().includes('cancelada')) onError(message);
    }
  }

  private setPreview(file: File): void {
    this.revokeObjectUrl();
    this.objectUrl = URL.createObjectURL(file);
    this.photoPreviewUrl.set(this.objectUrl);
  }
}
