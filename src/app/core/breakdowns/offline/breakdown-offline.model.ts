import type { Breakdown } from '../../models/breakdown.model';

export interface PendingBreakdownRegistration {
  localId: string;
  documentId: string;
  payload: Breakdown;
  createdAt: string;
}

export interface RegisterBreakdownResult {
  mode: 'online' | 'offline' | 'queued';
  reason?: 'auth-missing' | 'remote-error';
  synced: boolean;
  pendingCount: number;
  breakdown: Breakdown;
}
