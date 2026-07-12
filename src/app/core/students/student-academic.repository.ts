import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { FirestoreListResponse } from '../attendance/attendance-firestore.model';
import type { StudentAcademicRecord, StudentCourseUpdate } from './student-academic.model';
import { StudentAcademicMapper } from './student-academic.mapper';

@Injectable({ providedIn: 'root' })
export class StudentAcademicRepository {
  private readonly http = inject(HttpClient);
  private readonly mapper = new StudentAcademicMapper();
  private readonly baseUrl =
    `https://firestore.googleapis.com/v1/projects/${environment.firebase.projectId}` +
    '/databases/(default)/documents/estudiantes';

  findAll(idToken: string): Observable<StudentAcademicRecord[]> {
    return this.http
      .get<FirestoreListResponse>(`${this.baseUrl}?pageSize=500`, {
        headers: this.headers(idToken),
      })
      .pipe(
        map((response) =>
          (response.documents ?? [])
            .map((document) => this.mapper.fromDocument(document))
            .filter((student) => student.id && student.fullName),
        ),
      );
  }

  updateCourse(studentId: string, update: StudentCourseUpdate, idToken: string): Observable<unknown> {
    const url = `${this.baseUrl}/${encodeURIComponent(studentId)}?updateMask.fieldPaths=curso&updateMask.fieldPaths=asignaturas&updateMask.fieldPaths=updatedAt`;

    return this.http.patch(url, this.mapper.toStudentCourseUpdatePayload(update), {
      headers: this.headers(idToken),
    });
  }

  private headers(idToken: string): Record<string, string> {
    return { Authorization: `Bearer ${idToken}` };
  }
}
