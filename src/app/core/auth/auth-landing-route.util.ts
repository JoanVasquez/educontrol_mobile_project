import { APP_ROUTES } from '../constants/app-routes.constants';
import type { UserProfile } from '../users/user-profile.model';

const LANDING_ROUTE_BY_ROLE: Record<UserProfile['role'], string> = {
  admin: APP_ROUTES.home,
  director: APP_ROUTES.home,
  docente: APP_ROUTES.attendance,
};

export function resolveAuthLandingRoute(profile: Pick<UserProfile, 'role'>): string {
  return LANDING_ROUTE_BY_ROLE[profile.role] ?? APP_ROUTES.attendance;
}
