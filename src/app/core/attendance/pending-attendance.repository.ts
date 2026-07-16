import { Injectable, inject } from '@angular/core';
import type { AttendanceSheet, PendingAttendanceSheet } from './attendance.model';
import { APP_STORAGE_KEYS } from '../storage/app-storage.keys';
import { IonicKeyValueStorage } from '../storage/ionic-key-value.storage';

@Injectable({ providedIn: 'root' })
export class PendingAttendanceRepository {
  private readonly storage = inject(IonicKeyValueStorage);

  getAll(): PendingAttendanceSheet[] {
    return this.storage.getJson<PendingAttendanceSheet[]>(APP_STORAGE_KEYS.pendingAttendanceSheets, []);
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
    this.storage.setJson(APP_STORAGE_KEYS.pendingAttendanceSheets, queue);
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
