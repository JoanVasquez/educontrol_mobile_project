import { Injectable } from '@angular/core';
import type { AttendanceSheet, PendingAttendanceSheet } from './attendance.model';

const PENDING_ATTENDANCE_KEY = 'educontrol.pending.attendance-sheets';

@Injectable({ providedIn: 'root' })
export class PendingAttendanceRepository {
  getAll(): PendingAttendanceSheet[] {
    const rawQueue = localStorage.getItem(PENDING_ATTENDANCE_KEY);

    if (!rawQueue) {
      return [];
    }

    try {
      return JSON.parse(rawQueue) as PendingAttendanceSheet[];
    } catch {
      this.replaceAll([]);
      return [];
    }
  }

  upsert(sheet: AttendanceSheet): PendingAttendanceSheet[] {
    const now = new Date().toISOString();
    const existing = this.getAll();
    const previous = existing.find((item) => item.sheet.id === sheet.id);
    const pendingSheet: PendingAttendanceSheet = {
      localId: previous?.localId || crypto.randomUUID(),
      sheet,
      createdAt: previous?.createdAt || now,
      updatedAt: now,
    };
    const queue = [
      ...existing.filter((item) => item.sheet.id !== sheet.id),
      pendingSheet,
    ];

    this.replaceAll(queue);
    return queue;
  }

  replaceAll(queue: PendingAttendanceSheet[]): void {
    localStorage.setItem(PENDING_ATTENDANCE_KEY, JSON.stringify(queue));
  }

  removeBySheetId(sheetId: string): PendingAttendanceSheet[] {
    const queue = this.getAll().filter((item) => item.sheet.id !== sheetId);
    this.replaceAll(queue);
    return queue;
  }

  count(): number {
    return this.getAll().length;
  }
}
