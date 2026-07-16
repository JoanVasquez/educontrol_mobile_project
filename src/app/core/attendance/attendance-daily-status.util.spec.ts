import { AttendanceDailyStatusUtil } from './attendance-daily-status.util';
import type { AttendanceSheet } from './attendance.model';

describe('AttendanceDailyStatusUtil', () => {
  it('keeps the latest status per student across subject sheets', () => {
    const sheets: AttendanceSheet[] = [
      {
        id: '2026-07-14_primero_matematicas',
        course: 'Primero',
        subject: 'Matematicas',
        date: '2026-07-14',
        records: [{ studentId: 'student-1', studentName: 'Ana', status: 'present' }],
        createdBy: 'teacher-1',
        createdAt: '2026-07-14T08:00:00.000Z',
        updatedAt: '2026-07-14T08:00:00.000Z',
      },
      {
        id: '2026-07-14_primero_lengua-espanola',
        course: 'Primero',
        subject: 'Lengua Espanola',
        date: '2026-07-14',
        records: [{ studentId: 'student-1', studentName: 'Ana', status: 'absent' }],
        createdBy: 'teacher-1',
        createdAt: '2026-07-14T10:00:00.000Z',
        updatedAt: '2026-07-14T10:00:00.000Z',
      },
    ];

    const statuses = AttendanceDailyStatusUtil.latestByStudent(sheets);

    expect(statuses.get('student-1')?.status).toBe('absent');
  });
});
