import { Injectable } from '@angular/core';
import type { DashboardData } from './dashboard.model';

const DASHBOARD_CACHE_KEY = 'educontrol.cache.dashboard';

@Injectable({ providedIn: 'root' })
export class DashboardCacheRepository {
  get(): DashboardData | null {
    const rawDashboard = localStorage.getItem(DASHBOARD_CACHE_KEY);
    if (!rawDashboard) return null;

    try {
      return JSON.parse(rawDashboard) as DashboardData;
    } catch {
      localStorage.removeItem(DASHBOARD_CACHE_KEY);
      return null;
    }
  }

  save(dashboard: DashboardData): void {
    localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(dashboard));
  }
}
