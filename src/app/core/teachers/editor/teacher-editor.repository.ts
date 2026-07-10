import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { FirestoreTeacherDocument } from '../teacher-document.mapper';
import { TeacherFirestoreMapper } from '../teacher-firestore.mapper';
import type { TeacherRegistrationDraft } from '../teacher-registration.model';
import type { EditableTeacher } from './teacher-editor.model';
import { TeacherEditorMapper } from './teacher-editor.mapper';

const TEACHERS_COLLECTION = 'docentes';

@Injectable({ providedIn: 'root' })
export class TeacherEditorRepository {
  private readonly http = inject(HttpClient);
  private readonly documentMapper = new TeacherEditorMapper();
  private readonly firestoreMapper = new TeacherFirestoreMapper();
  private readonly projectId = environment.firebase.projectId;
  private readonly bucket = environment.firebase.storageBucket;

  findById(teacherId: string, idToken: string): Observable<EditableTeacher> {
    return this.http
      .get<FirestoreTeacherDocument>(this.documentUrl(teacherId), {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      .pipe(map((document) => this.documentMapper.fromDocument(document)));
  }

  save(teacherId: string, teacher: TeacherRegistrationDraft, idToken: string): Observable<unknown> {
    return this.http.patch(this.documentUrl(teacherId), this.firestoreMapper.toCreatePayload(teacher), {
      headers: { Authorization: `Bearer ${idToken}` },
    });
  }

  delete(teacherId: string, idToken: string): Observable<unknown> {
    return this.http.delete(this.documentUrl(teacherId), {
      headers: { Authorization: `Bearer ${idToken}` },
    });
  }

  deletePhoto(path: string, idToken: string): Observable<unknown> {
    const url = `https://firebasestorage.googleapis.com/v0/b/${this.bucket}/o/${encodeURIComponent(path)}`;
    return this.http.delete(url, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
  }

  private documentUrl(teacherId: string): string {
    return (
      `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/` +
      `${TEACHERS_COLLECTION}/${encodeURIComponent(teacherId)}`
    );
  }
}
