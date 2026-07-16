import { Injectable, inject } from '@angular/core';
import type { Breakdown } from '../../models/breakdown.model';
import { APP_STORAGE_KEYS } from '../../storage/app-storage.keys';
import { IonicKeyValueStorage } from '../../storage/ionic-key-value.storage';
import type { PendingBreakdownRegistration } from './breakdown-offline.model';

@Injectable({ providedIn: 'root' })
export class PendingBreakdownRepository {
  private readonly storage = inject(IonicKeyValueStorage);

  getAll(): PendingBreakdownRegistration[] {
    return this.storage.getJson<PendingBreakdownRegistration[]>(APP_STORAGE_KEYS.pendingBreakdownRegistrations, []);
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
    this.storage.setJson(APP_STORAGE_KEYS.pendingBreakdownRegistrations, queue);
  }

  count(): number {
    return this.getAll().length;
  }
}
