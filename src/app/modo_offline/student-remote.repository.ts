import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { StudentRegistrationDraft } from './student-registration.model';
import { StudentFirestoreMapper } from './student-firestore.mapper';

const STUDENTS_COLLECTION = 'estudiantes';

@Injectable({ providedIn: 'root' })
export class StudentRemoteRepository {
  private readonly http = inject(HttpClient);
  private readonly mapper = new StudentFirestoreMapper();
  private readonly projectId = environment.firebase.projectId;

  create(student: StudentRegistrationDraft, idToken: string): Observable<unknown> {
    const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/${STUDENTS_COLLECTION}`;

    return this.http.post(url, this.mapper.toCreatePayload(student), {
      headers: { Authorization: `Bearer ${idToken}` },
    });
  }
}
