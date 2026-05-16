import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthService } from './auth.service';

export const authenticatedGuard: CanActivateFn = (): ReturnType<CanActivateFn> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.waitUntilReady().pipe(
    filter(Boolean),
    take(1),
    map((): boolean | UrlTree => (authService.hasAnyRole(['admin', 'director', 'docente', 'secretaria']) ? true : router.createUrlTree(['/login']))),
  );
};

export const adminGuard: CanActivateFn = (): ReturnType<CanActivateFn> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.waitUntilReady().pipe(
    filter(Boolean),
    take(1),
    map((): boolean | UrlTree => (authService.hasAnyRole(['admin']) ? true : router.createUrlTree(['/home']))),
  );
};
