import type { AttendanceRoster } from '../attendance.model';
import { AttendanceSummaryPresenter } from './attendance-summary.presenter';

describe('AttendanceSummaryPresenter', () => {
  const presenter = new AttendanceSummaryPresenter();

  it('calculates metrics from real roster statuses', () => {
    const roster: AttendanceRoster = {
      courses: ['Tercero'],
      source: 'remote',
      students: [
        { id: '1', fullName: 'Uno', course: 'Tercero', photoUrl: '', status: 'present' },
        { id: '2', fullName: 'Dos', course: 'Tercero', photoUrl: '', status: 'absent' },
        { id: '3', fullName: 'Tres', course: 'Tercero', photoUrl: '', status: 'excused' },
        { id: '4', fullName: 'Cuatro', course: 'Tercero', photoUrl: '', status: null },
      ],
    };

    expect(presenter.present(roster).metrics).toEqual({
      total: 4,
      present: 1,
      absent: 1,
      excused: 1,
      unmarked: 1,
    });
  });

  it('avoids division by zero', () => {
    expect(presenter.percentage(0, 0)).toBe('0%');
  });
});
