import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserProfileRepository } from '../users/user-profile.repository';
import { UserProfile } from '../users/user-profile.model';
import { AuthSession } from './auth-session.model';
import { AuthService } from './auth.service';
import { FirebaseAuthApiService } from './firebase-auth-api.service';
import { SessionStorageService } from './session-storage.service';

describe('AuthService', () => {
  let service: AuthService;
  let authApi: jasmine.SpyObj<FirebaseAuthApiService>;
  let profileRepository: jasmine.SpyObj<UserProfileRepository>;
  let sessionStorage: jasmine.SpyObj<SessionStorageService>;

  const session: AuthSession = {
    uid: 'MDOkiUUciFa0ixvRFKlTax10yQ72',
    email: 'dev.joanvasquez@gmail.com',
    idToken: 'id-token',
    refreshToken: 'refresh-token',
    expiresAt: Date.now() + 3600_000,
  };

  const adminProfile: UserProfile = {
    uid: session.uid,
    email: session.email,
    fullName: 'Usuario IT',
    role: 'admin',
    status: 'active',
  };

  beforeEach(() => {
    authApi = jasmine.createSpyObj<FirebaseAuthApiService>('FirebaseAuthApiService', ['signInWithEmailAndPassword', 'refreshSession']);
    profileRepository = jasmine.createSpyObj<UserProfileRepository>('UserProfileRepository', ['findByUid']);
    sessionStorage = jasmine.createSpyObj<SessionStorageService>('SessionStorageService', ['getSession', 'setSession', 'clearSession']);
    sessionStorage.getSession.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: FirebaseAuthApiService, useValue: authApi },
        { provide: UserProfileRepository, useValue: profileRepository },
        { provide: SessionStorageService, useValue: sessionStorage },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('should authenticate and expose the admin profile', (done) => {
    authApi.signInWithEmailAndPassword.and.returnValue(of(session));
    profileRepository.findByUid.and.returnValue(of(adminProfile));

    service.signIn(session.email, 'valid-password').subscribe((profile) => {
      expect(profile).toEqual(adminProfile);
      expect(profileRepository.findByUid).toHaveBeenCalledOnceWith(session.uid, session.idToken);
      expect(sessionStorage.setSession).toHaveBeenCalledOnceWith(session);
      expect(service.hasAnyRole(['admin'])).toBeTrue();
      done();
    });
  });

  it('should map Firebase credential errors to a readable message', (done) => {
    authApi.signInWithEmailAndPassword.and.returnValue(throwError(() => ({ error: { message: 'INVALID_LOGIN_CREDENTIALS' } })));

    service.signIn(session.email, 'bad-password').subscribe({
      next: () => fail('Expected sign in to fail'),
      error: (error: Error) => {
        expect(error.message).toBe('Credenciales inválidas. Verifica tu correo y contraseña.');
        done();
      },
    });
  });
});
