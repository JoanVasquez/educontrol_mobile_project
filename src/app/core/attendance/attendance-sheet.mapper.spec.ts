import { AttendanceSheetMapper } from './attendance-sheet.mapper';
import type { AttendanceSheet } from './attendance.model';

describe('AttendanceSheetMapper', () => {
  it('serializes attendance records for Firestore', () => {
    const sheet: AttendanceSheet = {
      id: '2026-06-24_tercero',
      course: 'Tercero',
      subject: 'Lengua Espanola',
      date: '2026-06-24',
      records: [{ studentId: 'student-1', studentName: 'Joan Vásquez', status: 'present' }],
      createdBy: 'user-1',
      createdAt: '2026-06-24T10:00:00.000Z',
      updatedAt: '2026-06-24T10:00:00.000Z',
    };

    const payload = new AttendanceSheetMapper().toPayload(sheet);

    expect(payload.fields['course']).toEqual({ stringValue: 'Tercero' });
    expect(payload.fields['subject']).toEqual({ stringValue: 'Lengua Espanola' });
    expect(payload.fields['records'].arrayValue?.values?.length).toBe(1);
  });
});
