import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { catchError, map, of } from 'rxjs';
import { PendingBreakdownRepository } from '../offline/pending-breakdown.repository';
import { BreakdownService } from '../../firebase/breakdown.service';
import type { Breakdown } from '../../models/breakdown.model';
import type { BreakdownStatus, Priority } from '../../models/breakdown.model';
import type { BreakdownStatusResult } from './breakdown-status.model';
import { BreakdownStatusPresenter } from './breakdown-status.presenter';

@Injectable({ providedIn: 'root' })
export class BreakdownStatusService {
  private readonly breakdownService = inject(BreakdownService);
  private readonly pendingRepository = inject(PendingBreakdownRepository);
  private readonly presenter = new BreakdownStatusPresenter();

  load(): Observable<BreakdownStatusResult> {
    return this.breakdownService.getAllBreakdowns().pipe(
      map((breakdowns) => this.presenter.present(this.withPendingBreakdowns(breakdowns))),
      catchError((error: unknown) => {
        const pendingBreakdowns = this.pendingRepository.getAll().map((pending) => pending.payload);

        if (pendingBreakdowns.length) {
          return of(this.presenter.present(pendingBreakdowns));
        }

        throw error;
      }),
    );
  }

  priorityLabel(priority: Priority): string {
    return this.presenter.priorityLabel(priority);
  }

  statusLabel(status: BreakdownStatus): string {
    return this.presenter.statusLabel(status);
  }

  private withPendingBreakdowns(remoteBreakdowns: Breakdown[]): Breakdown[] {
    const remoteIds = new Set(remoteBreakdowns.map((breakdown) => breakdown.id).filter(Boolean));
    const pendingBreakdowns = this.pendingRepository
      .getAll()
      .filter((pending) => !remoteIds.has(pending.documentId))
      .map((pending) => pending.payload);

    return [...pendingBreakdowns, ...remoteBreakdowns];
  }
}
