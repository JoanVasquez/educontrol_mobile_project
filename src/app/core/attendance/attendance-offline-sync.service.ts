import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, EMPTY, catchError, firstValueFrom, from, map, of, switchMap } from 'rxjs';
import { NetworkService } from '../../detector_red/network.service';
import { ValidAuthSessionService } from '../auth/valid-auth-session.service';
import type { AttendanceSheet, PendingAttendanceSheet, SaveAttendanceResult } from './attendance.model';
import { AttendanceRepository } from './attendance.repository';
import { PendingAttendanceRepository } from './pending-attendance.repository';

@Injectable({ providedIn: 'root' })
export class AttendanceOfflineSyncService {
  private readonly networkService = inject(NetworkService);
  private readonly sessionService = inject(ValidAuthSessionService);
  private readonly repository = inject(AttendanceRepository);
  private readonly pendingRepository = inject(PendingAttendanceRepository);
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

  save(sheet: AttendanceSheet): Observable<SaveAttendanceResult> {
    if (!this.networkService.isOnline) {
      const queue = this.pendingRepository.upsert(sheet);
      this.pendingCountSubject.next(queue.length);

      return of({
        mode: 'offline',
        synced: false,
        pendingCount: queue.length,
        sheet,
      });
    }

    return this.sessionService.get().pipe(
      switchMap((session) => {
        if (!session) {
          return of(this.queueForLater(sheet, 'auth-missing'));
        }

        return this.repository.saveSheet(sheet, session.idToken).pipe(
          switchMap(() => {
            const queue = this.pendingRepository.removeBySheetId(sheet.id);
            this.pendingCountSubject.next(queue.length);

            return from(this.syncPending());
          }),
          map((pendingCount) => ({
            mode: 'online' as const,
            synced: true,
            pendingCount,
            sheet,
          })),
        );
      }),
      catchError((error) => {
        console.error('No se pudo guardar asistencia en Firebase:', this.toLoggableError(error));
        return of(this.queueForLater(sheet, 'remote-error'));
      }),
    );
  }

  async syncPending(): Promise<number> {
    if (this.syncing || !this.networkService.isOnline) {
      return this.pendingRepository.count();
    }

    const session = await firstValueFrom(this.sessionService.get());

    if (!session) {
      return this.pendingRepository.count();
    }

    this.syncing = true;
    const failedQueue: PendingAttendanceSheet[] = [];

    try {
      for (const pendingSheet of this.pendingRepository.getAll()) {
        try {
          await firstValueFrom(this.repository.saveSheet(pendingSheet.sheet, session.idToken));
        } catch (error) {
          console.error('No se pudo sincronizar asistencia pendiente:', this.toLoggableError(error));
          failedQueue.push(pendingSheet);
        }
      }
    } finally {
      this.pendingRepository.replaceAll(failedQueue);
      this.pendingCountSubject.next(failedQueue.length);
      this.syncing = false;
    }

    return failedQueue.length;
  }

  private queueForLater(sheet: AttendanceSheet, reason: 'auth-missing' | 'remote-error'): SaveAttendanceResult {
    const queue = this.pendingRepository.upsert(sheet);
    this.pendingCountSubject.next(queue.length);

    return {
      mode: 'queued',
      reason,
      synced: false,
      pendingCount: queue.length,
      sheet,
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
