import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { AuthSession } from './auth-session.model';
import { FirebaseAuthApiService } from './firebase-auth-api.service';
import { SessionStorageService } from './session-storage.service';
import { ValidAuthSessionService } from './valid-auth-session.service';

describe('ValidAuthSessionService', () => {
  let authApi: jasmine.SpyObj<FirebaseAuthApiService>;
  let sessionStorage: jasmine.SpyObj<SessionStorageService>;
  let service: ValidAuthSessionService;
  const freshSession: AuthSession = {
    uid: 'uid-1',
    email: 'admin@example.com',
    idToken: 'id-token',
    refreshToken: 'refresh-token',
    expiresAt: Date.now() + 120_000,
  };

  beforeEach(() => {
    authApi = jasmine.createSpyObj<FirebaseAuthApiService>('FirebaseAuthApiService', ['refreshSession']);
    sessionStorage = jasmine.createSpyObj<SessionStorageService>('SessionStorageService', ['getSession', 'setSession']);

    TestBed.configureTestingModule({
      providers: [
        ValidAuthSessionService,
        { provide: FirebaseAuthApiService, useValue: authApi },
        { provide: SessionStorageService, useValue: sessionStorage },
      ],
    });
    service = TestBed.inject(ValidAuthSessionService);
  });

  it('returns null when there is no stored session', (done) => {
    sessionStorage.getSession.and.returnValue(null);

    service.get().subscribe((session) => {
      expect(session).toBeNull();
      expect(authApi.refreshSession).not.toHaveBeenCalled();
      done();
    });
  });

  it('returns fresh sessions without refreshing', (done) => {
    sessionStorage.getSession.and.returnValue(freshSession);

    service.get().subscribe((session) => {
      expect(session).toBe(freshSession);
      expect(authApi.refreshSession).not.toHaveBeenCalled();
      done();
    });
  });

  it('refreshes expiring sessions and stores the refreshed value', (done) => {
    const expiring = { ...freshSession, expiresAt: Date.now() };
    const refreshed = { ...freshSession, idToken: 'new-token' };
    sessionStorage.getSession.and.returnValue(expiring);
    authApi.refreshSession.and.returnValue(of(refreshed));

    service.get().subscribe((session) => {
      expect(session).toBe(refreshed);
      expect(sessionStorage.setSession).toHaveBeenCalledOnceWith(refreshed);
      done();
    });
  });

  it('returns null when refresh fails', (done) => {
    sessionStorage.getSession.and.returnValue({ ...freshSession, expiresAt: Date.now() });
    authApi.refreshSession.and.returnValue(throwError(() => new Error('refresh failed')));

    service.get().subscribe((session) => {
      expect(session).toBeNull();
      done();
    });
  });
});
