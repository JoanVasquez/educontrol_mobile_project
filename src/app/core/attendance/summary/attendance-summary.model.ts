import type { AttendanceStatus } from '../attendance.model';

export interface AttendanceSummaryStudent {
  id: string;
  fullName: string;
  photoUrl: string;
  status: AttendanceStatus | null;
}

export interface AttendanceMetrics {
  total: number;
  present: number;
  absent: number;
  excused: number;
  unmarked: number;
}

export interface AttendanceSummaryResult {
  courses: string[];
  students: AttendanceSummaryStudent[];
  metrics: AttendanceMetrics;
  source: 'remote' | 'cache';
}
