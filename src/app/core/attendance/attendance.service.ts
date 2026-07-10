import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { catchError, forkJoin, map, of, switchMap, throwError } from 'rxjs';
import { ValidAuthSessionService } from '../auth/valid-auth-session.service';
import { AttendanceCacheRepository } from './attendance-cache.repository';
import { AttendanceDateUtil } from './attendance-date.util';
import type { AttendanceRoster, AttendanceSheet, AttendanceStudent } from './attendance.model';
import { AttendanceRepository } from './attendance.repository';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly sessionService = inject(ValidAuthSessionService);
  private readonly repository = inject(AttendanceRepository);
  private readonly cache = inject(AttendanceCacheRepository);

  load(course: string, date: string): Observable<AttendanceRoster> {
    return this.sessionService.get().pipe(
      switchMap((session) => {
        if (!session) return this.fromCache(course, date, 'No hay una sesión válida para consultar estudiantes.');

        const documentId = AttendanceDateUtil.documentId(course, date);
        const sheetRequest = course
          ? this.repository
              .findSheet(documentId, session.idToken)
              .pipe(catchError((error: unknown) => this.isNotFound(error) ? of(null) : throwError(() => error)))
          : of(null);

        return forkJoin({
          students: this.repository.findStudents(session.idToken),
          sheet: sheetRequest,
        }).pipe(
          map(({ students, sheet }) => {
            this.cache.saveStudents(students);
            if (sheet) this.cache.saveSheet(sheet);
            return this.toRoster(students, sheet, course, 'remote');
          }),
          catchError(() => this.fromCache(course, date, 'No se pudo cargar el pase de lista desde Firebase.')),
        );
      }),
    );
  }

  save(course: string, date: string, students: AttendanceStudent[]): Observable<AttendanceSheet> {
    const unmarked = students.filter((student) => !student.status);
    if (unmarked.length) {
      return throwError(() => new Error(`Falta marcar la asistencia de ${unmarked.length} estudiante(s).`));
    }

    return this.sessionService.get().pipe(
      switchMap((session) => {
        if (!session) return throwError(() => new Error('No hay una sesión válida para guardar la asistencia.'));

        const id = AttendanceDateUtil.documentId(course, date);
        const previous = this.cache.getSheet(id);
        const now = new Date().toISOString();
        const sheet: AttendanceSheet = {
          id,
          course,
          date,
          records: students.map((student) => ({
            studentId: student.id,
            studentName: student.fullName,
            status: student.status!,
          })),
          createdBy: previous?.createdBy || session.uid,
          createdAt: previous?.createdAt || now,
          updatedAt: now,
        };

        return this.repository.saveSheet(sheet, session.idToken).pipe(
          map(() => {
            this.cache.saveSheet(sheet);
            return sheet;
          }),
        );
      }),
    );
  }

  private fromCache(course: string, date: string, message: string): Observable<AttendanceRoster> {
    const students = this.cache.getStudents();
    if (!students.length) return throwError(() => new Error(message));

    const sheet = course ? this.cache.getSheet(AttendanceDateUtil.documentId(course, date)) : null;
    return of(this.toRoster(students, sheet, course, 'cache'));
  }

  private toRoster(
    students: AttendanceStudent[],
    sheet: AttendanceSheet | null,
    course: string,
    source: 'remote' | 'cache',
  ): AttendanceRoster {
    const statuses = new Map(sheet?.records.map((record) => [record.studentId, record.status]) ?? []);
    const courses = [...new Set(students.map((student) => student.course))].sort((a, b) => a.localeCompare(b, 'es'));

    return {
      courses,
      students: students
        .filter((student) => !course || student.course === course)
        .map((student) => ({ ...student, status: statuses.get(student.id) ?? null }))
        .sort((a, b) => a.fullName.localeCompare(b.fullName, 'es')),
      source,
    };
  }

  private isNotFound(error: unknown): boolean {
    return error instanceof HttpErrorResponse && error.status === 404;
  }
}
