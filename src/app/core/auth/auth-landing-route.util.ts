import type { UserProfile } from '../users/user-profile.model';

const LANDING_ROUTE_BY_ROLE: Record<UserProfile['role'], string> = {
  admin: '/home',
  director: '/home',
  docente: '/asistencia',
};

export function resolveAuthLandingRoute(profile: Pick<UserProfile, 'role'>): string {
  return LANDING_ROUTE_BY_ROLE[profile.role] ?? '/asistencia';
}
