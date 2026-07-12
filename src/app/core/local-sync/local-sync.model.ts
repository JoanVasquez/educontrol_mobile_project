import type { AttendanceSheet } from '../attendance/attendance.model';
import type { Breakdown } from '../models/breakdown.model';

export type LocalSyncPayloadType = 'attendance-sheet' | 'breakdown-report';

export interface LocalSyncEnvelope<TPayload = unknown> {
  id: string;
  type: LocalSyncPayloadType;
  version: 1;
  deviceId: string;
  createdAt: string;
  payload: TPayload;
}

export interface LocalSyncSummary {
  attendanceCount: number;
  breakdownCount: number;
  totalCount: number;
}

export type AttendanceSyncEnvelope = LocalSyncEnvelope<AttendanceSheet>;
export type BreakdownSyncEnvelope = LocalSyncEnvelope<Breakdown & { documentId: string }>;
export type SyncableEnvelope = AttendanceSyncEnvelope | BreakdownSyncEnvelope;
