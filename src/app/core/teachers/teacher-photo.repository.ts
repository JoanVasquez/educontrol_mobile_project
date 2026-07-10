import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { SerializedTeacherPhoto } from './teacher-registration.model';
import { DataUrlFileSerializer } from './utils/data-url-file.serializer';

interface FirebaseStorageUploadResponse {
  bucket: string;
  name: string;
  downloadTokens?: string;
}

export interface UploadedTeacherPhoto {
  path: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class TeacherPhotoRepository {
  private readonly http = inject(HttpClient);
  private readonly serializer = new DataUrlFileSerializer();
  private readonly bucket = environment.firebase.storageBucket;

  upload(photo: SerializedTeacherPhoto, teacherLocalId: string, idToken: string): Observable<UploadedTeacherPhoto> {
    const extension = this.serializer.extensionFrom(photo.name);
    const path = `docentes/${teacherLocalId}/perfil.${extension}`;
    const url = `https://firebasestorage.googleapis.com/v0/b/${this.bucket}/o?uploadType=media&name=${encodeURIComponent(path)}`;
    const body = this.serializer.toBlob(photo);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${idToken}`,
      'Content-Type': photo.contentType,
    });

    return this.http.post<FirebaseStorageUploadResponse>(url, body, { headers }).pipe(
      map((response) => ({
        path: response.name,
        url: this.toDownloadUrl(response),
      })),
    );
  }

  private toDownloadUrl(response: FirebaseStorageUploadResponse): string {
    const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${response.bucket}/o/${encodeURIComponent(response.name)}?alt=media`;
    const token = response.downloadTokens?.split(',')[0];

    return token ? `${baseUrl}&token=${encodeURIComponent(token)}` : baseUrl;
  }
}
