import { Injectable } from '@angular/core';
import type { AuthSession } from './auth-session.model';

const SESSION_KEY = 'educontrol.auth.session';

@Injectable({ providedIn: 'root' })
export class SessionStorageService {
  getSession(): AuthSession | null {
    const rawSession = localStorage.getItem(SESSION_KEY);

    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as AuthSession;
    } catch {
      this.clearSession();
      return null;
    }
  }

  setSession(session: AuthSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  }
}
