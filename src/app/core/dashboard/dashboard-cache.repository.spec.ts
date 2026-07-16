import type { DashboardData } from './dashboard.model';
import { DashboardCacheRepository } from './dashboard-cache.repository';

describe('DashboardCacheRepository', () => {
  const repository = new DashboardCacheRepository();
  const dashboard: DashboardData = {
    metrics: [{ icon: 'student', label: 'Estudiantes', value: '10', helper: 'Total' }],
    weeklyAbsences: [{ label: 'lun', value: 1 }],
    pendingBreakdowns: 2,
    source: 'remote',
    updatedAt: '2026-07-15T10:00:00.000Z',
  };

  beforeEach(() => localStorage.clear());

  it('returns null when the dashboard cache is empty', () => {
    expect(repository.get()).toBeNull();
  });

  it('saves and reads dashboard data', () => {
    repository.save(dashboard);

    expect(repository.get()).toEqual(dashboard);
  });

  it('removes malformed dashboard cache entries', () => {
    localStorage.setItem('educontrol.cache.dashboard', '{bad');

    expect(repository.get()).toBeNull();
    expect(localStorage.getItem('educontrol.cache.dashboard')).toBeNull();
  });
});
