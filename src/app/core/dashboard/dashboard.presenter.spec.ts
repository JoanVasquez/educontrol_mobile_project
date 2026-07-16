import type { AttendanceSheet } from '../attendance/attendance.model';
import type { Breakdown } from '../models/breakdown.model';
import { DashboardPresenter } from './dashboard.presenter';
import type { DashboardSnapshot } from './dashboard.model';

describe('DashboardPresenter', () => {
  const presenter = new DashboardPresenter();

  const sheet: AttendanceSheet = {
    id: 'sheet-1',
    date: '2026-07-15',
    subject: 'Matemática',
    course: '1ro A',
    records: [
      { studentId: 's1', studentName: 'Ana', status: 'present' },
      { studentId: 's2', studentName: 'Luis', status: 'absent' },
    ],
    createdBy: 'admin',
    createdAt: '2026-07-15T09:00:00.000Z',
    updatedAt: '2026-07-15T10:00:00.000Z',
  };

  const breakdown: Breakdown = {
    id: 'b1',
    category: 'Otra',
    description: 'Puerta',
    priority: 'low',
    location: 'Entrada',
    photoUrl: null,
    photoDataUrl: null,
    photoName: null,
    photoContentType: null,
    videoDataUrl: null,
    videoName: null,
    videoContentType: null,
    status: 'pending',
    notes: null,
    createdAt: '2026-07-15T10:00:00.000Z',
  };

  it('calculates dashboard metrics and weekly absences', () => {
    const snapshot: DashboardSnapshot = {
      students: [
        { id: 's1', fullName: 'Ana', course: '1ro A', photoUrl: '', status: null },
        { id: 's2', fullName: 'Luis', course: '1ro A', photoUrl: '', status: null },
      ],
      sheets: [
        sheet,
        { ...sheet, id: 'sheet-2', date: '2026-07-14', records: [{ studentId: 's3', studentName: 'Eva', status: 'absent' }] },
      ],
      teachers: [{
        id: 't1',
        email: 'prof@example.com',
        authUid: 'teacher-auth',
        firstName: 'Prof.',
        lastName: 'Mora',
        birthDate: '',
        nationality: '',
        gender: '',
        idNumber: '',
        address: '',
        phone: '',
        assignments: [],
        courses: [],
        photoUrl: '',
        status: 'active',
      }],
      breakdowns: [breakdown, { ...breakdown, id: 'b2', status: 'resolved' }],
      today: '2026-07-15',
    };

    const result = presenter.present(snapshot, 'remote');

    expect(result.metrics.map((metric) => metric.value)).toEqual(['2', '50%', '1', '1']);
    expect(result.weeklyAbsences.length).toBe(6);
    expect(result.weeklyAbsences[result.weeklyAbsences.length - 1].value).toBe(1);
    expect(result.pendingBreakdowns).toBe(1);
    expect(result.source).toBe('remote');
    expect(new Date(result.updatedAt).getTime()).not.toBeNaN();
  });

  it('uses empty-state attendance metrics when there are no records today', () => {
    const result = presenter.present({
      students: [],
      sheets: [],
      teachers: [],
      breakdowns: [],
      today: '2026-07-15',
    }, 'cache');

    expect(result.metrics[1]).toEqual(jasmine.objectContaining({
      value: '0%',
      helper: 'Sin registros',
    }));
  });
});
