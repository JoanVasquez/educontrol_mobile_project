import { Injectable } from '@angular/core';
import type { SyncableEnvelope } from './local-sync.model';

@Injectable({ providedIn: 'root' })
export class LocalSyncSerializer {
  serialize(envelopes: SyncableEnvelope[]): string {
    return JSON.stringify({
      schema: 'educontrol.local-sync',
      version: 1,
      envelopes,
    });
  }
}
