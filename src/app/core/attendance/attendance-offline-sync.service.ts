import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, EMPTY, catchError, firstValueFrom, from, map, of, switchMap, tap } from 'rxjs';
import { NetworkService } from '../../detector_red/network.service';
import { ValidAuthSessionService } from '../auth/valid-auth-session.service';
import { DOMAIN_EVENTS } from '../events/domain-event.constants';
import { DomainEventBusService } from '../events/domain-event-bus.service';
import type { AttendanceSheet, PendingAttendanceSheet, SaveAttendanceResult } from './attendance.model';
import { AttendanceRepository } from './attendance.repository';
import { PendingAttendanceRepository } from './pending-attendance.repository';

@Injectable({ providedIn: 'root' })
export class AttendanceOfflineSyncService {
  private readonly networkService = inject(NetworkService);
  private readonly sessionService = inject(ValidAuthSessionService);
  private readonly repository = inject(AttendanceRepository);
  private readonly pendingRepository = inject(PendingAttendanceRepository);
  private readonly events = inject(DomainEventBusService);
  private readonly pendingCountSubject = new BehaviorSubject<number>(this.pendingRepository.count());

  private syncing = false;

  readonly pendingCount$ = this.pendingCountSubject.asObservable();

  constructor() {
    // Al recuperar internet se sincronizan automaticamente las listas pendientes.
    this.networkService.isOnline$
      .pipe(
        switchMap((isOnline) => (isOnline ? from(this.syncPending()) : EMPTY)),
        catchError(() => EMPTY),
      )
      .subscribe();
  }

  save(sheet: AttendanceSheet): Observable<SaveAttendanceResult> {
    // Offline-first: siempre queda una copia local antes de intentar Firebase.
    // Si la app se cierra, se pierde internet o Firestore rechaza el request, el pase sigue en cola.
    const initialQueue = this.pendingRepository.upsert(sheet);
    this.pendingCountSubject.next(initialQueue.length);

    // Sin conexion se guarda localmente y se devuelve una respuesta positiva para la UI.
    if (!this.networkService.isOnline) {
      this.publishChanged(sheet);

      return of({
        mode: 'offline',
        synced: false,
        pendingCount: initialQueue.length,
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
            // Si el envio remoto fue exitoso, se elimina cualquier version pendiente.
            const queue = this.pendingRepository.removeBySheetId(sheet.id);
            this.pendingCountSubject.next(queue.length);

            return from(this.syncPending());
          }),
          tap(() => this.publishChanged(sheet)),
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
      // Solo permanecen en cola las asistencias que vuelvan a fallar durante este intento.
      for (const pendingSheet of this.pendingRepository.getAll()) {
        try {
          await firstValueFrom(this.repository.saveSheet(pendingSheet.sheet, session.idToken));
          this.publishChanged(pendingSheet.sheet);
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
    this.publishChanged(sheet);

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

  private publishChanged(sheet: AttendanceSheet): void {
    this.events.publish(DOMAIN_EVENTS.attendanceChanged, {
      id: sheet.id,
      course: sheet.course,
      subject: sheet.subject,
      date: sheet.date,
    });
  }
}
