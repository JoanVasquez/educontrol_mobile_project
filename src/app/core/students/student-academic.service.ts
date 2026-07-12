import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, EMPTY, catchError, combineLatest, firstValueFrom, from, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { getAcademicSubjectsByCourse, normalizeAcademicCourse } from '../academic/academic-course.catalog';
import { NetworkService } from '../../detector_red/network.service';
import { ValidAuthSessionService } from '../auth/valid-auth-session.service';
import type { UserProfile } from '../users/user-profile.model';
import type { PendingStudentCourseUpdate, StudentAcademicRecord, StudentCourseUpdate } from './student-academic.model';
import { PendingStudentCourseRepository } from './pending-student-course.repository';
import { StudentAcademicCacheRepository } from './student-academic-cache.repository';
import { StudentAcademicRepository } from './student-academic.repository';

@Injectable({ providedIn: 'root' })
export class StudentAcademicService {
  private readonly authService = inject(AuthService);
  private readonly cacheRepository = inject(StudentAcademicCacheRepository);
  private readonly networkService = inject(NetworkService);
  private readonly pendingRepository = inject(PendingStudentCourseRepository);
  private readonly repository = inject(StudentAcademicRepository);
  private readonly validSession = inject(ValidAuthSessionService);
  private readonly pendingCountSubject = new BehaviorSubject<number>(this.pendingRepository.count());

  private syncing = false;

  readonly pendingCount$ = this.pendingCountSubject.asObservable();

  constructor() {
    this.networkService.isOnline$
      .pipe(
        switchMap((isOnline) => (isOnline ? from(this.syncPending()) : EMPTY)),
        catchError(() => EMPTY),
      )
      .subscribe();
  }

  load(): Observable<StudentAcademicRecord[]> {
    if (!this.networkService.isOnline) {
      return of(this.cachedStudents());
    }

    return this.sessionContext().pipe(
      switchMap(({ idToken }) =>
        this.repository.findAll(idToken).pipe(
          map((students) => this.normalizeStudents(students)),
          tap((students) => this.cacheRepository.replaceAll(students)),
          map((students) => this.mergePendingUpdates(students)),
          catchError(() => of(this.cachedStudents())),
        ),
      ),
      catchError(() => of(this.cachedStudents())),
    );
  }

  changeCourse(studentId: string, course: string): Observable<unknown> {
    const normalizedCourse = normalizeAcademicCourse(course);
    const subjects = getAcademicSubjectsByCourse(normalizedCourse);

    if (!subjects.length) {
      return throwError(() => new Error('Selecciona un curso valido.'));
    }

    return this.sessionContext().pipe(
      switchMap(({ idToken, profile }) => {
        if (!['admin', 'director'].includes(profile.role)) {
          return throwError(() => new Error('Solo el admin o director puede cambiar el curso del estudiante.'));
        }

        const update = {
          course: normalizedCourse,
          subjects,
          updatedAt: new Date().toISOString(),
        };

        if (!this.networkService.isOnline) {
          return of(this.queueForLater(studentId, update));
        }

        return this.repository.updateCourse(studentId, update, idToken).pipe(
          tap(() => {
            this.pendingRepository.removeByStudentId(studentId);
            this.pendingCountSubject.next(this.pendingRepository.count());
            this.cacheRepository.applyCourseUpdate(studentId, update);
          }),
          switchMap(() => from(this.syncPending())),
          catchError((error) => {
            console.error('No se pudo actualizar el curso del estudiante:', this.toLoggableError(error));
            return of(this.queueForLater(studentId, update));
          }),
        );
      }),
    );
  }

  async syncPending(): Promise<number> {
    if (this.syncing || !this.networkService.isOnline) {
      return this.pendingRepository.count();
    }

    const session = await firstValueFrom(this.validSession.get());

    if (!session) {
      return this.pendingRepository.count();
    }

    this.syncing = true;
    const failedQueue: PendingStudentCourseUpdate[] = [];

    try {
      for (const pendingUpdate of this.pendingRepository.getAll()) {
        try {
          await firstValueFrom(
            this.repository.updateCourse(pendingUpdate.studentId, pendingUpdate.update, session.idToken),
          );
          this.cacheRepository.applyCourseUpdate(pendingUpdate.studentId, pendingUpdate.update);
        } catch (error) {
          console.error('No se pudo sincronizar cambio de curso pendiente:', this.toLoggableError(error));
          failedQueue.push(pendingUpdate);
        }
      }
    } finally {
      this.pendingRepository.replaceAll(failedQueue);
      this.pendingCountSubject.next(failedQueue.length);
      this.syncing = false;
    }

    return failedQueue.length;
  }

  private sessionContext(): Observable<{ idToken: string; profile: UserProfile }> {
    return combineLatest([this.authService.session$, this.authService.profile$]).pipe(
      take(1),
      map(([session, profile]) => {
        if (!session || !profile) {
          throw new Error('No hay una sesion activa.');
        }

        return { idToken: session.idToken, profile };
      }),
    );
  }

  private queueForLater(studentId: string, update: StudentCourseUpdate): StudentCourseUpdate {
    const queue = this.pendingRepository.upsert(studentId, update);
    this.pendingCountSubject.next(queue.length);
    this.cacheRepository.applyCourseUpdate(studentId, update);
    return update;
  }

  private cachedStudents(): StudentAcademicRecord[] {
    return this.mergePendingUpdates(this.normalizeStudents(this.cacheRepository.getAll()));
  }

  private normalizeStudents(students: StudentAcademicRecord[]): StudentAcademicRecord[] {
    return students.map((student) => ({
      ...student,
      course: normalizeAcademicCourse(student.course),
      subjects: student.subjects.length ? student.subjects : getAcademicSubjectsByCourse(student.course),
    }));
  }

  private mergePendingUpdates(students: StudentAcademicRecord[]): StudentAcademicRecord[] {
    const pendingByStudentId = new Map(this.pendingRepository.getAll().map((item) => [item.studentId, item.update]));

    return students.map((student) => {
      const pendingUpdate = pendingByStudentId.get(student.id);

      return pendingUpdate
        ? {
            ...student,
            course: pendingUpdate.course,
            subjects: pendingUpdate.subjects,
            updatedAt: pendingUpdate.updatedAt,
          }
        : student;
    });
  }

  private toLoggableError(error: unknown): string {
    if (error && typeof error === 'object') {
      const maybeHttpError = error as { status?: unknown; statusText?: unknown; message?: unknown; error?: unknown };

      return JSON.stringify({
        status: maybeHttpError.status,
        statusText: maybeHttpError.statusText,
        message: maybeHttpError.message,
        error: maybeHttpError.error,
      });
    }

    return String(error);
  }
}
