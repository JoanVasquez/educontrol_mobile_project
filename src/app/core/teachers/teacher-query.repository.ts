import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { FirestoreTeacherDocument } from './teacher-document.mapper';
import { TeacherDocumentMapper } from './teacher-document.mapper';
import type { Teacher } from './teacher.model';

interface FirestoreTeacherListResponse {
  documents?: FirestoreTeacherDocument[];
}

const TEACHERS_COLLECTION = 'docentes';

@Injectable({ providedIn: 'root' })
export class TeacherQueryRepository {
  private readonly http = inject(HttpClient);
  private readonly mapper = new TeacherDocumentMapper();
  private readonly projectId = environment.firebase.projectId;

  findAll(idToken: string): Observable<Teacher[]> {
    const url =
      `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/` +
      `${TEACHERS_COLLECTION}?pageSize=100`;

    return this.http
      .get<FirestoreTeacherListResponse>(url, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      .pipe(
        map((response) =>
          (response.documents ?? [])
            .map((document) => this.mapper.fromDocument(document))
            .filter((teacher) => teacher.status.toLowerCase() !== 'inactive'),
        ),
      );
  }
}
