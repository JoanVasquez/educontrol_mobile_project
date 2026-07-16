import { inject } from '@angular/core';
import type { CanActivateFn, UrlTree } from '@angular/router';
import { Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { APP_ROUTES } from '../constants/app-routes.constants';
import type { UserRole } from '../users/user-profile.model';
import { AuthService } from './auth.service';

export const authenticatedGuard: CanActivateFn = (): ReturnType<CanActivateFn> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.waitUntilReady().pipe(
    filter(Boolean),
    take(1),
    map((): boolean | UrlTree => (authService.hasAnyRole(['admin', 'director', 'docente']) ? true : router.createUrlTree([APP_ROUTES.login]))),
  );
};

export const adminGuard: CanActivateFn = (): ReturnType<CanActivateFn> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.waitUntilReady().pipe(
    filter(Boolean),
    take(1),
    map((): boolean | UrlTree => (authService.hasAnyRole(['admin']) ? true : router.createUrlTree([APP_ROUTES.home]))),
  );
};

export const roleGuard = (allowedRoles: UserRole[], fallbackPath: string = APP_ROUTES.home): CanActivateFn => (): ReturnType<CanActivateFn> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.waitUntilReady().pipe(
    filter(Boolean),
    take(1),
    map((): boolean | UrlTree => (authService.hasAnyRole(allowedRoles) ? true : router.createUrlTree([fallbackPath]))),
  );
};
