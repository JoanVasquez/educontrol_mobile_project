import { Injectable, inject } from '@angular/core';
import { PendingAttendanceRepository } from '../attendance/pending-attendance.repository';
import { BluetoothService } from '../bluetooth/bluetooth.service';
import type { BluetoothSendResult } from '../bluetooth/bluetooth.model';
import { PendingBreakdownRepository } from '../breakdowns/offline/pending-breakdown.repository';
import { LocalDeviceRepository } from './local-device.repository';
import { LocalSyncSerializer } from './local-sync.serializer';
import type { LocalSyncSummary, SyncableEnvelope } from './local-sync.model';

@Injectable({ providedIn: 'root' })
export class LocalSyncService {
  private readonly bluetooth = inject(BluetoothService);
  private readonly deviceRepository = inject(LocalDeviceRepository);
  private readonly pendingAttendance = inject(PendingAttendanceRepository);
  private readonly pendingBreakdowns = inject(PendingBreakdownRepository);
  private readonly serializer = inject(LocalSyncSerializer);

  getSummary(): LocalSyncSummary {
    const attendanceCount = this.pendingAttendance.count();
    const breakdownCount = this.pendingBreakdowns.count();

    return {
      attendanceCount,
      breakdownCount,
      totalCount: attendanceCount + breakdownCount,
    };
  }

  createPendingEnvelopes(): SyncableEnvelope[] {
    const deviceId = this.deviceRepository.getDeviceId();
    const attendance = this.pendingAttendance.getAll().map(
      (pending): SyncableEnvelope => ({
        id: pending.localId,
        type: 'attendance-sheet',
        version: 1,
        deviceId,
        createdAt: pending.updatedAt,
        payload: pending.sheet,
      }),
    );
    const breakdowns = this.pendingBreakdowns.getAll().map(
      (pending): SyncableEnvelope => ({
        id: pending.localId,
        type: 'breakdown-report',
        version: 1,
        deviceId,
        createdAt: pending.createdAt,
        payload: {
          ...pending.payload,
          documentId: pending.documentId,
        },
      }),
    );

    return [...attendance, ...breakdowns];
  }

  async sendPending(deviceId: string): Promise<BluetoothSendResult> {
    const envelopes = this.createPendingEnvelopes();
    if (!envelopes.length) {
      return {
        success: false,
        message: 'No hay registros pendientes para enviar.',
      };
    }

    return this.bluetooth.sendMessage(deviceId, this.serializer.serialize(envelopes));
  }
}
