import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, EMPTY, catchError, firstValueFrom, from, map, of, switchMap } from 'rxjs';
import { NetworkService } from '../detector_red/network.service';
import { AuthService } from '../core/auth/auth.service';
import { PendingStudentStorageRepository } from './pending-student-storage.repository';
import type { PendingStudentRegistration, RegisterStudentResult, StudentRegistrationDraft } from './student-registration.model';
import { StudentRemoteRepository } from './student-remote.repository';

@Injectable({ providedIn: 'root' })
export class StudentOfflineSyncService {
  private readonly networkService = inject(NetworkService);
  private readonly pendingRepository = inject(PendingStudentStorageRepository);
  private readonly remoteRepository = inject(StudentRemoteRepository);
  private readonly authService = inject(AuthService);
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

    return this.authService.getValidSession().pipe(
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

    const session = await firstValueFrom(this.authService.getValidSession());

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
