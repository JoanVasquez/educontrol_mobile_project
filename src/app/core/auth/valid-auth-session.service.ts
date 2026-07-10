import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { catchError, map, of } from 'rxjs';
import type { AuthSession } from './auth-session.model';
import { FirebaseAuthApiService } from './firebase-auth-api.service';
import { SessionStorageService } from './session-storage.service';

const REFRESH_THRESHOLD_MILLISECONDS = 60_000;

@Injectable({ providedIn: 'root' })
export class ValidAuthSessionService {
  private readonly authApi = inject(FirebaseAuthApiService);
  private readonly sessionStorage = inject(SessionStorageService);

  get(): Observable<AuthSession | null> {
    const session = this.sessionStorage.getSession();

    if (!session) {
      return of(null);
    }

    if (session.expiresAt - REFRESH_THRESHOLD_MILLISECONDS > Date.now()) {
      return of(session);
    }

    return this.authApi.refreshSession(session).pipe(
      map((refreshedSession) => {
        this.sessionStorage.setSession(refreshedSession);
        return refreshedSession;
      }),
      catchError(() => of(null)),
    );
  }
}
