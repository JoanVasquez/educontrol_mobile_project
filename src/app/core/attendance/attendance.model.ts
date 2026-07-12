export type AttendanceStatus = 'present' | 'absent' | 'excused';

export interface AttendanceStudent {
  id: string;
  fullName: string;
  course: string;
  photoUrl: string;
  status: AttendanceStatus | null;
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
}

export interface AttendanceSheet {
  id: string;
  course: string;
  subject: string;
  date: string;
  records: AttendanceRecord[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRoster {
  courses: string[];
  subjects: string[];
  students: AttendanceStudent[];
  source: 'remote' | 'cache';
}

export interface PendingAttendanceSheet {
  localId: string;
  sheet: AttendanceSheet;
  createdAt: string;
  updatedAt: string;
}

export interface SaveAttendanceResult {
  mode: 'online' | 'offline' | 'queued';
  reason?: 'auth-missing' | 'remote-error';
  synced: boolean;
  pendingCount: number;
  sheet: AttendanceSheet;
}
