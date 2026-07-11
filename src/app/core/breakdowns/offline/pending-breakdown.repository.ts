import { Injectable } from '@angular/core';
import type { Breakdown } from '../../models/breakdown.model';
import type { PendingBreakdownRegistration } from './breakdown-offline.model';

const PENDING_BREAKDOWNS_KEY = 'educontrol.pending.breakdown-registrations';

@Injectable({ providedIn: 'root' })
export class PendingBreakdownRepository {
  getAll(): PendingBreakdownRegistration[] {
    const rawQueue = localStorage.getItem(PENDING_BREAKDOWNS_KEY);

    if (!rawQueue) {
      return [];
    }

    try {
      return JSON.parse(rawQueue) as PendingBreakdownRegistration[];
    } catch {
      this.replaceAll([]);
      return [];
    }
  }

  add(documentId: string, payload: Breakdown): PendingBreakdownRegistration[] {
    const queue = [
      ...this.getAll(),
      {
        localId: crypto.randomUUID(),
        documentId,
        payload,
        createdAt: new Date().toISOString(),
      },
    ];

    this.replaceAll(queue);
    return queue;
  }

  replaceAll(queue: PendingBreakdownRegistration[]): void {
    localStorage.setItem(PENDING_BREAKDOWNS_KEY, JSON.stringify(queue));
  }

  count(): number {
    return this.getAll().length;
  }
}
