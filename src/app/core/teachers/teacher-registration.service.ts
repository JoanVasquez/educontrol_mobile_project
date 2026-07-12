import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, EMPTY, catchError, firstValueFrom, from, map, of, switchMap } from 'rxjs';
import { FirebaseAuthApiService } from '../auth/firebase-auth-api.service';
import type { AuthSession } from '../auth/auth-session.model';
import { SessionStorageService } from '../auth/session-storage.service';
import { NetworkService } from '../../detector_red/network.service';
import { PendingTeacherRepository } from './pending-teacher.repository';
import { TeacherPhotoRepository } from './teacher-photo.repository';
import { TeacherAccessRepository } from './teacher-access.repository';
import { DEFAULT_TEACHER_PASSWORD } from './teacher-access.constants';
import type {
  PendingTeacherRegistration,
  RegisterTeacherResult,
  TeacherRegistrationCommand,
  TeacherRegistrationDraft,
} from './teacher-registration.model';
import { TeacherRemoteRepository } from './teacher-remote.repository';

@Injectable({ providedIn: 'root' })
export class TeacherRegistrationService {
  private readonly networkService = inject(NetworkService);
  private readonly pendingRepository = inject(PendingTeacherRepository);
  private readonly remoteRepository = inject(TeacherRemoteRepository);
  private readonly accessRepository = inject(TeacherAccessRepository);
  private readonly photoRepository = inject(TeacherPhotoRepository);
  private readonly authApi = inject(FirebaseAuthApiService);
  private readonly sessionStorage = inject(SessionStorageService);
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

  register(command: TeacherRegistrationCommand): Observable<RegisterTeacherResult> {
    if (!this.networkService.isOnline) {
      return of(this.queue(command, 'offline'));
    }

    return this.getValidSession().pipe(
      switchMap((session) => {
        if (!session) {
          return of(this.queue(command, 'queued', 'auth-missing'));
        }

        return from(this.persist(command, session.idToken)).pipe(
          switchMap(() => from(this.syncPending())),
          map((pendingCount) => ({
            mode: 'online' as const,
            synced: true,
            pendingCount,
          })),
        );
      }),
      catchError((error) => {
        console.error('No se pudo registrar el docente en Firebase:', this.toLoggableError(error));

        if (this.isPermissionDenied(error)) {
          return of<RegisterTeacherResult>({
            mode: 'rejected',
            reason: 'permission-denied',
            synced: false,
            pendingCount: this.pendingRepository.count(),
          });
        }

        if (this.isEmailAlreadyInUse(error)) {
          return of<RegisterTeacherResult>({
            mode: 'rejected',
            reason: 'auth-user-exists',
            synced: false,
            pendingCount: this.pendingRepository.count(),
          });
        }

        return of(this.queue(command, 'queued', 'remote-error'));
      }),
    );
  }

  async syncPending(): Promise<number> {
    if (this.syncing || !this.networkService.isOnline) {
      return this.pendingRepository.count();
    }

    const session = await firstValueFrom(this.getValidSession());

    if (!session) {
      return this.pendingRepository.count();
    }

    this.syncing = true;
    const failedQueue: PendingTeacherRegistration[] = [];

    try {
      for (const pending of this.pendingRepository.getAll()) {
        try {
          await this.persist(pending.command, session.idToken);
        } catch (error) {
          console.error('No se pudo sincronizar docente pendiente:', this.toLoggableError(error));
          failedQueue.push(pending);
        }
      }
    } finally {
      this.pendingRepository.replaceAll(failedQueue);
      this.pendingCountSubject.next(failedQueue.length);
      this.syncing = false;
    }

    return failedQueue.length;
  }

  private async persist(command: TeacherRegistrationCommand, idToken: string): Promise<void> {
    const teacherAccount = await firstValueFrom(
      this.authApi.createUserWithEmailAndPassword(command.teacher.email, DEFAULT_TEACHER_PASSWORD),
    );
    let teacher: TeacherRegistrationDraft = {
      ...command.teacher,
      authUid: teacherAccount.uid,
    };

    if (command.photo) {
      const uploadedPhoto = await firstValueFrom(this.photoRepository.upload(command.photo, command.registrationId, idToken));
      teacher = {
        ...teacher,
        photoPath: uploadedPhoto.path,
        photoUrl: uploadedPhoto.url,
      };
    }

    await firstValueFrom(this.remoteRepository.save(command.registrationId, teacher, idToken));
    await firstValueFrom(
      this.accessRepository.saveUserProfile(
        {
          uid: teacherAccount.uid,
          email: teacher.email,
          fullName: `${teacher.firstName} ${teacher.lastName}`.trim(),
          codigo: teacher.idNumber,
          createdAt: teacher.createdAt,
          updatedAt: teacher.updatedAt,
        },
        idToken,
      ),
    );
  }

  private queue(
    command: TeacherRegistrationCommand,
    mode: 'offline' | 'queued',
    reason?: 'auth-missing' | 'auth-user-exists' | 'remote-error',
  ): RegisterTeacherResult {
    const queue = this.pendingRepository.add(command);
    this.pendingCountSubject.next(queue.length);

    return {
      mode,
      reason,
      synced: false,
      pendingCount: queue.length,
    };
  }

  private getValidSession(): Observable<AuthSession | null> {
    const session = this.sessionStorage.getSession();

    if (!session) {
      return of(null);
    }

    if (session.expiresAt - 60_000 > Date.now()) {
      return of(session);
    }

    return this.authApi.refreshSession(session).pipe(
      map((refreshedSession) => {
        this.sessionStorage.setSession(refreshedSession);
        return refreshedSession;
      }),
      catchError(() => of(null)),
    );
  }

  private toLoggableError(error: unknown): string {
    if (error && typeof error === 'object') {
      const httpError = error as { status?: unknown; statusText?: unknown; message?: unknown; error?: unknown };
      return JSON.stringify({
        status: httpError.status,
        statusText: httpError.statusText,
        message: httpError.message,
        error: httpError.error,
      });
    }

    return String(error);
  }

  private isPermissionDenied(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const httpError = error as { status?: unknown; error?: { error?: { status?: unknown } } };
    return httpError.status === 403 || httpError.error?.error?.status === 'PERMISSION_DENIED';
  }

  private isEmailAlreadyInUse(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const httpError = error as { error?: { error?: { message?: unknown } } };
    return httpError.error?.error?.message === 'EMAIL_EXISTS';
  }
}
