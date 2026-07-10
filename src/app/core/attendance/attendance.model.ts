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
  date: string;
  records: AttendanceRecord[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRoster {
  courses: string[];
  students: AttendanceStudent[];
  source: 'remote' | 'cache';
}
