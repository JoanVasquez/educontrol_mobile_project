import type { AuthSession } from './auth-session.model';
import { SessionStorageService } from './session-storage.service';

describe('SessionStorageService', () => {
  const service = new SessionStorageService();
  const session: AuthSession = {
    uid: 'uid-1',
    email: 'admin@example.com',
    idToken: 'id-token',
    refreshToken: 'refresh-token',
    expiresAt: 123,
  };

  beforeEach(() => localStorage.clear());

  it('returns null when no session is stored', () => {
    expect(service.getSession()).toBeNull();
  });

  it('persists and reads an auth session', () => {
    service.setSession(session);

    expect(service.getSession()).toEqual(session);
  });

  it('clears invalid JSON and explicit sessions', () => {
    localStorage.setItem('educontrol.auth.session', '{bad');

    expect(service.getSession()).toBeNull();
    expect(localStorage.getItem('educontrol.auth.session')).toBeNull();

    service.setSession(session);
    service.clearSession();
    expect(service.getSession()).toBeNull();
  });
});
