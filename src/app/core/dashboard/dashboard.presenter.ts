import { Injectable } from '@angular/core';
import type { AttendanceRecord, AttendanceSheet } from '../attendance/attendance.model';
import type { Breakdown } from '../models/breakdown.model';
import type { DashboardData, DashboardSnapshot, DashboardSource, DashboardWeeklyPoint } from './dashboard.model';

const WEEK_DAYS = 6;

@Injectable({ providedIn: 'root' })
export class DashboardPresenter {
  present(snapshot: DashboardSnapshot, source: DashboardSource): DashboardData {
    const todaySheets = snapshot.sheets.filter((sheet) => sheet.date === snapshot.today);
    const todayRecords = this.getRecords(todaySheets);
    const presentCount = todayRecords.filter((record) => record.status === 'present').length;
    const absentCount = todayRecords.filter((record) => record.status === 'absent').length;
    const attendanceRate = todayRecords.length ? Math.round((presentCount / todayRecords.length) * 100) : 0;
    const pendingBreakdowns = this.countPendingBreakdowns(snapshot.breakdowns);

    return {
      metrics: [
        {
          icon: 'student',
          label: 'Estudiantes inscritos',
          value: String(snapshot.students.length),
          helper: 'Total',
        },
        {
          icon: 'attendance',
          label: 'Asistencia del dia',
          value: `${attendanceRate}%`,
          helper: todayRecords.length ? 'Presente' : 'Sin registros',
        },
        {
          icon: 'absence',
          label: 'Ausencia del dia',
          value: String(absentCount),
          helper: 'Hoy',
        },
        {
          icon: 'teacher',
          label: 'Docentes activos',
          value: String(snapshot.teachers.length),
          helper: 'Total',
        },
      ],
      weeklyAbsences: this.createWeeklyAbsences(snapshot.sheets, snapshot.today),
      pendingBreakdowns,
      source,
      updatedAt: new Date().toISOString(),
    };
  }

  private createWeeklyAbsences(sheets: AttendanceSheet[], today: string): DashboardWeeklyPoint[] {
    return this.lastDays(today, WEEK_DAYS).map((date) => ({
      label: this.formatShortDay(date),
      value: this.countAbsences(sheets, date),
    }));
  }

  private countAbsences(sheets: AttendanceSheet[], date: string): number {
    return sheets
      .filter((sheet) => sheet.date === date)
      .reduce<AttendanceRecord[]>((records, sheet) => [...records, ...sheet.records], [])
      .filter((record) => record.status === 'absent').length;
  }

  private getRecords(sheets: AttendanceSheet[]): AttendanceRecord[] {
    return sheets.reduce<AttendanceRecord[]>((records, sheet) => [...records, ...sheet.records], []);
  }

  private countPendingBreakdowns(breakdowns: Breakdown[]): number {
    return breakdowns.filter((breakdown) => breakdown.status === 'pending').length;
  }

  private lastDays(today: string, amount: number): string[] {
    const [year, month, day] = today.split('-').map(Number);
    const baseDate = new Date(year, month - 1, day);

    return Array.from({ length: amount }, (_, index) => {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() - (amount - 1 - index));
      return this.formatDateId(date);
    });
  }

  private formatDateId(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }

  private formatShortDay(dateId: string): string {
    const [year, month, day] = dateId.split('-').map(Number);
    const label = new Intl.DateTimeFormat('es-DO', { weekday: 'short' }).format(new Date(year, month - 1, day));
    return label.replace('.', '');
  }
}
