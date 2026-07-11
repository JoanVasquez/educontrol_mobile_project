import { Injectable } from '@angular/core';
import type { AttendanceSheet, AttendanceStudent } from './attendance.model';

const STUDENTS_KEY = 'educontrol.cache.attendance.students';
const SHEET_INDEX_KEY = 'educontrol.cache.attendance.sheet-ids';
const SHEET_PREFIX = 'educontrol.cache.attendance.sheet:';

@Injectable({ providedIn: 'root' })
export class AttendanceCacheRepository {
  getStudents(): AttendanceStudent[] {
    return this.read<AttendanceStudent[]>(STUDENTS_KEY) ?? [];
  }

  saveStudents(students: AttendanceStudent[]): void {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  }

  getSheet(documentId: string): AttendanceSheet | null {
    return this.read<AttendanceSheet>(`${SHEET_PREFIX}${documentId}`);
  }

  getSheets(): AttendanceSheet[] {
    return this.getSheetIds()
      .map((documentId) => this.getSheet(documentId))
      .filter((sheet): sheet is AttendanceSheet => Boolean(sheet));
  }

  saveSheet(sheet: AttendanceSheet): void {
    localStorage.setItem(`${SHEET_PREFIX}${sheet.id}`, JSON.stringify(sheet));
    this.saveSheetId(sheet.id);
  }

  private read<T>(key: string): T | null {
    const value = localStorage.getItem(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }

  private getSheetIds(): string[] {
    return this.read<string[]>(SHEET_INDEX_KEY) ?? [];
  }

  private saveSheetId(documentId: string): void {
    const sheetIds = this.getSheetIds();
    if (sheetIds.includes(documentId)) return;

    localStorage.setItem(SHEET_INDEX_KEY, JSON.stringify([...sheetIds, documentId]));
  }
}
