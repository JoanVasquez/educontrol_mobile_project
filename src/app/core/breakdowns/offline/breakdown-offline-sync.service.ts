import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, EMPTY, catchError, firstValueFrom, from, map, of, switchMap } from 'rxjs';
import { NetworkService } from '../../../detector_red/network.service';
import { BreakdownService } from '../../firebase/breakdown.service';
import type { Breakdown } from '../../models/breakdown.model';
import type { PendingBreakdownRegistration, RegisterBreakdownResult } from './breakdown-offline.model';
import { PendingBreakdownRepository } from './pending-breakdown.repository';

@Injectable({ providedIn: 'root' })
export class BreakdownOfflineSyncService {
  private readonly networkService = inject(NetworkService);
  private readonly pendingRepository = inject(PendingBreakdownRepository);
  private readonly breakdownService = inject(BreakdownService);
  private readonly pendingCountSubject = new BehaviorSubject<number>(this.pendingRepository.count());

  private syncing = false;

  readonly pendingCount$ = this.pendingCountSubject.asObservable();

  constructor() {
    // Las averias pendientes se intentan enviar automaticamente al volver online.
    this.networkService.isOnline$
      .pipe(
        switchMap((isOnline) => (isOnline ? from(this.syncPending()) : EMPTY)),
        catchError(() => EMPTY),
      )
      .subscribe();
  }

  register(breakdown: Breakdown, documentId: string): Observable<RegisterBreakdownResult> {
    // El documentId se crea antes de guardar para que local y remoto compartan el mismo registro.
    const payload = { ...breakdown, id: documentId };

    if (!this.networkService.isOnline) {
      // Offline-first: la UI puede continuar aunque Firebase no este disponible.
      const queue = this.pendingRepository.add(documentId, payload);
      this.pendingCountSubject.next(queue.length);

      return of({
        mode: 'offline',
        synced: false,
        pendingCount: queue.length,
        breakdown: payload,
      });
    }

    return this.breakdownService.createBreakdown(payload, documentId).pipe(
      switchMap((savedBreakdown) =>
        from(this.syncPending()).pipe(
          map((pendingCount) => ({
            mode: 'online' as const,
            synced: true,
            pendingCount,
            breakdown: savedBreakdown,
          })),
        ),
      ),
      catchError((error) => {
        console.error('No se pudo registrar la averia en Firebase:', this.toLoggableError(error));
        return of(this.queueForLater(documentId, payload, this.reasonFrom(error)));
      }),
    );
  }

  async syncPending(): Promise<number> {
    if (this.syncing || !this.networkService.isOnline) {
      return this.pendingRepository.count();
    }

    this.syncing = true;
    const failedQueue: PendingBreakdownRegistration[] = [];

    try {
      // Se reconstruye la cola solo con los reportes que no pudieron sincronizarse.
      for (const pendingBreakdown of this.pendingRepository.getAll()) {
        try {
          await firstValueFrom(
            this.breakdownService.createBreakdown(pendingBreakdown.payload, pendingBreakdown.documentId),
          );
        } catch (error) {
          console.error('No se pudo sincronizar averia pendiente:', this.toLoggableError(error));
          failedQueue.push(pendingBreakdown);
        }
      }
    } finally {
      this.pendingRepository.replaceAll(failedQueue);
      this.pendingCountSubject.next(failedQueue.length);
      this.syncing = false;
    }

    return failedQueue.length;
  }

  private queueForLater(
    documentId: string,
    breakdown: Breakdown,
    reason: 'auth-missing' | 'remote-error',
  ): RegisterBreakdownResult {
    const queue = this.pendingRepository.add(documentId, breakdown);
    this.pendingCountSubject.next(queue.length);

    return {
      mode: 'queued',
      reason,
      synced: false,
      pendingCount: queue.length,
      breakdown,
    };
  }

  private reasonFrom(error: unknown): 'auth-missing' | 'remote-error' {
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    return message.includes('iniciar sesion') || message.includes('sesion') ? 'auth-missing' : 'remote-error';
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
