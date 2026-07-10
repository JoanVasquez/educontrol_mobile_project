import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { FirestoreDocument, FirestoreListResponse } from './attendance-firestore.model';
import type { AttendanceSheet, AttendanceStudent } from './attendance.model';
import { AttendanceSheetMapper } from './attendance-sheet.mapper';
import { AttendanceStudentMapper } from './attendance-student.mapper';

@Injectable({ providedIn: 'root' })
export class AttendanceRepository {
  private readonly http = inject(HttpClient);
  private readonly studentMapper = new AttendanceStudentMapper();
  private readonly sheetMapper = new AttendanceSheetMapper();
  private readonly baseUrl =
    `https://firestore.googleapis.com/v1/projects/${environment.firebase.projectId}` +
    '/databases/(default)/documents';

  findStudents(idToken: string): Observable<AttendanceStudent[]> {
    return this.http
      .get<FirestoreListResponse>(`${this.baseUrl}/estudiantes?pageSize=500`, {
        headers: this.headers(idToken),
      })
      .pipe(
        map((response) =>
          (response.documents ?? [])
            .filter((document) => this.studentMapper.isActive(document))
            .map((document) => this.studentMapper.fromDocument(document))
            .filter((student) => student.id && student.fullName && student.course),
        ),
      );
  }

  findSheet(documentId: string, idToken: string): Observable<AttendanceSheet> {
    return this.http
      .get<FirestoreDocument>(`${this.baseUrl}/asistencias/${encodeURIComponent(documentId)}`, {
        headers: this.headers(idToken),
      })
      .pipe(map((document) => this.sheetMapper.fromDocument(document)));
  }

  saveSheet(sheet: AttendanceSheet, idToken: string): Observable<unknown> {
    return this.http.patch(
      `${this.baseUrl}/asistencias/${encodeURIComponent(sheet.id)}`,
      this.sheetMapper.toPayload(sheet),
      { headers: this.headers(idToken) },
    );
  }

  private headers(idToken: string): Record<string, string> {
    return { Authorization: `Bearer ${idToken}` };
  }
}
