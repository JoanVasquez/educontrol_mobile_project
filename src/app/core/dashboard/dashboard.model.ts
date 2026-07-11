import type { AttendanceSheet, AttendanceStudent } from '../attendance/attendance.model';
import type { Breakdown } from '../models/breakdown.model';
import type { Teacher } from '../teachers/teacher.model';

export interface DashboardMetric {
  icon: string;
  label: string;
  value: string;
  helper: string;
}

export interface DashboardWeeklyPoint {
  label: string;
  value: number;
}

export type DashboardSource = 'remote' | 'cache';

export interface DashboardData {
  metrics: DashboardMetric[];
  weeklyAbsences: DashboardWeeklyPoint[];
  pendingBreakdowns: number;
  source: DashboardSource;
  updatedAt: string;
}

export interface DashboardSnapshot {
  students: AttendanceStudent[];
  sheets: AttendanceSheet[];
  teachers: Teacher[];
  breakdowns: Breakdown[];
  today: string;
}
