import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TeacherFirestoreMapper } from './teacher-firestore.mapper';
import type { TeacherRegistrationDraft } from './teacher-registration.model';

const TEACHERS_COLLECTION = 'docentes';

@Injectable({ providedIn: 'root' })
export class TeacherRemoteRepository {
  private readonly http = inject(HttpClient);
  private readonly mapper = new TeacherFirestoreMapper();
  private readonly projectId = environment.firebase.projectId;

  save(documentId: string, teacher: TeacherRegistrationDraft, idToken: string): Observable<unknown> {
    const url =
      `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/` +
      `${TEACHERS_COLLECTION}/${encodeURIComponent(documentId)}`;

    return this.http.patch(url, this.mapper.toCreatePayload(teacher), {
      headers: { Authorization: `Bearer ${idToken}` },
    });
  }
}
