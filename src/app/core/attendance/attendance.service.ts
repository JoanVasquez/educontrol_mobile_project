import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { catchError, forkJoin, map, of, switchMap, throwError } from 'rxjs';
import { SessionStorageService } from '../auth/session-storage.service';
import { ValidAuthSessionService } from '../auth/valid-auth-session.service';
import { AttendanceAccessService } from './attendance-access.service';
import type { AttendanceAccessContext } from './attendance-access.model';
import { AttendanceOfflineSyncService } from './attendance-offline-sync.service';
import { AttendanceCacheRepository } from './attendance-cache.repository';
import { AttendanceDateUtil } from './attendance-date.util';
import type { AttendanceRoster, AttendanceSheet, AttendanceStudent, SaveAttendanceResult } from './attendance.model';
import { AttendanceRepository } from './attendance.repository';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly sessionService = inject(ValidAuthSessionService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly repository = inject(AttendanceRepository);
  private readonly cache = inject(AttendanceCacheRepository);
  private readonly offlineSyncService = inject(AttendanceOfflineSyncService);
  private readonly accessService = inject(AttendanceAccessService);

  load(course: string, date: string, subject = ''): Observable<AttendanceRoster> {
    return this.sessionService.get().pipe(
      switchMap((session) => {
        if (!session) return this.fromCache(course, date, subject, 'No hay una sesión válida para consultar estudiantes.');

        const documentId = AttendanceDateUtil.documentId(course, date, subject);
        const sheetRequest = course && subject
          ? this.repository
              .findSheet(documentId, session.idToken)
              .pipe(catchError((error: unknown) => this.isNotFound(error) ? of(null) : throwError(() => error)))
          : of(null);

        return forkJoin({
          access: this.accessService.load(session.idToken),
          students: this.repository.findStudents(session.idToken),
          sheet: sheetRequest,
        }).pipe(
          map(({ access, students, sheet }) => {
            this.cache.saveStudents(students);
            if (sheet) this.cache.saveSheet(sheet);
            return this.toRoster(students, sheet, course, subject, access, 'remote');
          }),
          catchError(() => this.fromCache(course, date, subject, 'No se pudo cargar el pase de lista desde Firebase.')),
        );
      }),
    );
  }

  save(course: string, date: string, students: AttendanceStudent[], subject = ''): Observable<SaveAttendanceResult> {
    const unmarked = students.filter((student) => !student.status);
    if (unmarked.length) {
      return throwError(() => new Error(`Falta marcar la asistencia de ${unmarked.length} estudiante(s).`));
    }

    if (!subject) {
      return throwError(() => new Error('Selecciona una asignatura para guardar la asistencia.'));
    }

    return this.sessionService.get().pipe(
      switchMap((session) => {
        const fallbackSession = this.sessionStorage.getSession();

        if (!session && !fallbackSession) {
          return throwError(() => new Error('No hay una sesión válida para guardar la asistencia.'));
        }

        return this.accessService.load((session ?? fallbackSession)!.idToken).pipe(
          switchMap((access) => {
            if (!this.accessService.canAccess(course, subject, access)) {
              return throwError(() => new Error('No tienes permisos para pasar lista en este curso y asignatura.'));
            }

            const id = AttendanceDateUtil.documentId(course, date, subject);
            const previous = this.cache.getSheet(id);
            const now = new Date().toISOString();
            const sheet: AttendanceSheet = {
              id,
              course,
              subject,
              date,
              records: students.map((student) => ({
                studentId: student.id,
                studentName: student.fullName,
                status: student.status!,
              })),
              createdBy: previous?.createdBy || session?.uid || fallbackSession?.uid || 'offline',
              createdAt: previous?.createdAt || now,
              updatedAt: now,
            };

            return this.offlineSyncService.save(sheet).pipe(
              map((result) => {
                this.cache.saveSheet(sheet);
                return result;
              }),
            );
          }),
        );
      }),
    );
  }

  private fromCache(course: string, date: string, subject: string, message: string): Observable<AttendanceRoster> {
    const students = this.cache.getStudents();
    if (!students.length) return throwError(() => new Error(message));

    const sheet = course ? this.cache.getSheet(AttendanceDateUtil.documentId(course, date, subject)) : null;
    const courses = [...new Set(students.map((student) => student.course))].sort((a, b) => a.localeCompare(b, 'es'));

    return of({
      courses,
      subjects: [],
      students: students
        .filter((student) => !course || student.course === course)
        .map((student) => ({ ...student, status: sheet?.records.find((record) => record.studentId === student.id)?.status ?? null }))
        .sort((a, b) => a.fullName.localeCompare(b.fullName, 'es')),
      source: 'cache',
    });
  }

  private toRoster(
    students: AttendanceStudent[],
    sheet: AttendanceSheet | null,
    course: string,
    subject: string,
    access: AttendanceAccessContext,
    source: 'remote' | 'cache',
  ): AttendanceRoster {
    const statuses = new Map(sheet?.records.map((record) => [record.studentId, record.status]) ?? []);
    const courses = this.accessService.coursesForStudents([...new Set(students.map((student) => student.course))], access);
    const selectedCourse = course || courses[0] || '';
    const subjects = selectedCourse ? this.accessService.subjectsForCourse(selectedCourse, access) : [];
    const selectedSubject = subject || subjects[0] || '';

    return {
      courses,
      subjects,
      students: students
        .filter((student) => this.accessService.canAccess(student.course, selectedSubject, access))
        .filter((student) => !selectedCourse || student.course === selectedCourse)
        .map((student) => ({ ...student, status: statuses.get(student.id) ?? null }))
        .sort((a, b) => a.fullName.localeCompare(b.fullName, 'es')),
      source,
    };
  }

  private isNotFound(error: unknown): boolean {
    return error instanceof HttpErrorResponse && error.status === 404;
  }
}
