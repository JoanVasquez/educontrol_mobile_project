import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, EMPTY, catchError, combineLatest, firstValueFrom, from, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { getAcademicSubjectsByCourse, normalizeAcademicCourse } from '../academic/academic-course.catalog';
import { NetworkService } from '../../detector_red/network.service';
import { ValidAuthSessionService } from '../auth/valid-auth-session.service';
import { toLoggableError } from '../utils/loggable-error.util';
import type { UserProfile } from '../users/user-profile.model';
import type { PendingStudentCourseUpdate, StudentAcademicRecord, StudentCourseUpdate } from './student-academic.model';
import { PendingStudentCourseRepository } from './pending-student-course.repository';
import { StudentAcademicCacheRepository } from './student-academic-cache.repository';
import { StudentAcademicPresenter } from './student-academic.presenter';
import { StudentAcademicRepository } from './student-academic.repository';

@Injectable({ providedIn: 'root' })
export class StudentAcademicService {
  private readonly authService = inject(AuthService);
  private readonly cacheRepository = inject(StudentAcademicCacheRepository);
  private readonly networkService = inject(NetworkService);
  private readonly pendingRepository = inject(PendingStudentCourseRepository);
  private readonly presenter = inject(StudentAcademicPresenter);
  private readonly repository = inject(StudentAcademicRepository);
  private readonly validSession = inject(ValidAuthSessionService);
  private readonly pendingCountSubject = new BehaviorSubject<number>(this.pendingRepository.count());

  private syncing = false;

  readonly pendingCount$ = this.pendingCountSubject.asObservable();

  constructor() {
    // Cuando vuelve la conexion, intenta enviar los cambios de curso guardados localmente.
    this.networkService.isOnline$
      .pipe(
        switchMap((isOnline) => (isOnline ? from(this.syncPending()) : EMPTY)),
        catchError(() => EMPTY),
      )
      .subscribe();
  }

  load(): Observable<StudentAcademicRecord[]> {
    // Offline-first: si no hay red, la pantalla se alimenta de cache local.
    if (!this.networkService.isOnline) {
      return of(this.cachedStudents());
    }

    return this.sessionContext().pipe(
      switchMap(({ idToken }) =>
        this.repository.findAll(idToken).pipe(
          map((students) => this.presenter.normalize(students)),
          tap((students) => this.cacheRepository.replaceAll(students)),
          map((students) => this.withPendingUpdates(students)),
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
            console.error('No se pudo actualizar el curso del estudiante:', toLoggableError(error));
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
          console.error('No se pudo sincronizar cambio de curso pendiente:', toLoggableError(error));
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
    // La cola usa upsert para conservar solo el ultimo cambio pendiente por estudiante.
    const queue = this.pendingRepository.upsert(studentId, update);
    this.pendingCountSubject.next(queue.length);
    this.cacheRepository.applyCourseUpdate(studentId, update);
    return update;
  }

  private cachedStudents(): StudentAcademicRecord[] {
    return this.withPendingUpdates(this.presenter.normalize(this.cacheRepository.getAll()));
  }

  private withPendingUpdates(students: StudentAcademicRecord[]): StudentAcademicRecord[] {
    return this.presenter.mergePendingUpdates(students, this.pendingRepository.getAll());
  }
}
