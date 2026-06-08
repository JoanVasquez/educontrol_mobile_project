import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, EMPTY, catchError, firstValueFrom, from, map, of, switchMap } from 'rxjs';
import { NetworkService } from '../detector_red/network.service';
import { FirebaseAuthApiService } from '../core/auth/firebase-auth-api.service';
import type { AuthSession } from '../core/auth/auth-session.model';
import { SessionStorageService } from '../core/auth/session-storage.service';
import { PendingStudentStorageRepository } from './pending-student-storage.repository';
import type { PendingStudentRegistration, RegisterStudentResult, StudentRegistrationDraft } from './student-registration.model';
import { StudentRemoteRepository } from './student-remote.repository';

@Injectable({ providedIn: 'root' })
export class StudentOfflineSyncService {
  private readonly networkService = inject(NetworkService);
  private readonly pendingRepository = inject(PendingStudentStorageRepository);
  private readonly remoteRepository = inject(StudentRemoteRepository);
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

  register(student: StudentRegistrationDraft): Observable<RegisterStudentResult> {
    if (!this.networkService.isOnline) {
      const queue = this.pendingRepository.add(student);
      this.pendingCountSubject.next(queue.length);

      return of<RegisterStudentResult>({
        mode: 'offline',
        synced: false,
        pendingCount: queue.length,
      });
    }

    return this.getValidSession().pipe(
      switchMap((session) => {
        if (!session) {
          console.error('No se pudo registrar el estudiante en Firebase: no hay sesion local vigente.');
          return of(this.queueForLater(student, 'auth-missing'));
        }

        return this.remoteRepository.create(student, session.idToken).pipe(
          switchMap(() => from(this.syncPending())),
          map((pendingCount) => ({
            mode: 'online' as const,
            synced: true,
            pendingCount,
          })),
        );
      }),
      catchError((error) => {
        console.error('No se pudo registrar el estudiante en Firebase:', this.toLoggableError(error));
        return of(this.queueForLater(student, 'remote-error'));
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
    const failedQueue: PendingStudentRegistration[] = [];

    for (const pendingStudent of this.pendingRepository.getAll()) {
      try {
        await firstValueFrom(this.remoteRepository.create(pendingStudent.payload, session.idToken));
      } catch (error) {
        console.error('No se pudo sincronizar estudiante pendiente:', this.toLoggableError(error));
        failedQueue.push(pendingStudent);
      }
    }

    this.pendingRepository.replaceAll(failedQueue);
    this.pendingCountSubject.next(failedQueue.length);
    this.syncing = false;

    return failedQueue.length;
  }

  private queueForLater(student: StudentRegistrationDraft, reason: 'auth-missing' | 'remote-error'): RegisterStudentResult {
    const queue = this.pendingRepository.add(student);
    this.pendingCountSubject.next(queue.length);

    return {
      mode: 'queued',
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

    if (!this.isExpired(session)) {
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

  private isExpired(session: AuthSession): boolean {
    const refreshThresholdMilliseconds = 60_000;
    return session.expiresAt - refreshThresholdMilliseconds <= Date.now();
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
