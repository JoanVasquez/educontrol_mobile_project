import { DashboardDateUtil } from './dashboard-date.util';

describe('DashboardDateUtil', () => {
  it('returns the requested date window ending today', () => {
    expect(DashboardDateUtil.lastDays('2026-03-02', 4)).toEqual([
      '2026-02-27',
      '2026-02-28',
      '2026-03-01',
      '2026-03-02',
    ]);
  });
});
