import { Injectable, inject } from '@angular/core';
import type { Observable} from 'rxjs';
import { BehaviorSubject, catchError, finalize, map, of, switchMap, tap, throwError } from 'rxjs';
import { UserProfileRepository } from '../users/user-profile.repository';
import type { UserProfile, UserRole } from '../users/user-profile.model';
import type { AuthSession } from './auth-session.model';
import { mapFirebaseAuthError } from './auth-error.mapper';
import { FirebaseAuthApiService } from './firebase-auth-api.service';
import { SessionStorageService } from './session-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(FirebaseAuthApiService);
  private readonly profileRepository = inject(UserProfileRepository);
  private readonly sessionStorage = inject(SessionStorageService);

  private readonly sessionSubject = new BehaviorSubject<AuthSession | null>(null);
  private readonly profileSubject = new BehaviorSubject<UserProfile | null>(null);
  private readonly initializedSubject = new BehaviorSubject<boolean>(false);

  readonly session$ = this.sessionSubject.asObservable();
  readonly profile$ = this.profileSubject.asObservable();
  readonly initialized$ = this.initializedSubject.asObservable();
  readonly isAuthenticated$ = this.session$.pipe(map((session) => Boolean(session)));

  constructor() {
    this.restoreSession().subscribe();
  }

  signIn(email: string, password: string): Observable<UserProfile> {
    return this.authApi.signInWithEmailAndPassword(email, password).pipe(
      switchMap((session) => this.loadUserProfile(session)),
      catchError((error) => throwError(() => new Error(mapFirebaseAuthError(error)))),
    );
  }

  signOut(): void {
    this.clearSession();
  }

  getValidSession(): Observable<AuthSession | null> {
    const storedSession = this.sessionStorage.getSession();

    if (!storedSession) {
      return of(null);
    }

    if (!this.isExpired(storedSession)) {
      this.sessionSubject.next(storedSession);
      return of(storedSession);
    }

    return this.authApi.refreshSession(storedSession).pipe(
      tap((session) => {
        this.sessionStorage.setSession(session);
        this.sessionSubject.next(session);
      }),
      catchError(() => {
        this.clearSessionIfCurrent(storedSession);
        return of(null);
      }),
    );
  }

  waitUntilReady(): Observable<boolean> {
    return this.initialized$.pipe(map((initialized) => initialized));
  }

  hasAnyRole(allowedRoles: UserRole[]): boolean {
    const profile = this.profileSubject.value;
    return Boolean(profile && profile.status === 'active' && allowedRoles.includes(profile.role));
  }

  private restoreSession(): Observable<UserProfile | null> {
    const storedSession = this.sessionStorage.getSession();

    if (!storedSession) {
      this.initializedSubject.next(true);
      return of(null);
    }

    const session$ = this.isExpired(storedSession)
      ? this.authApi.refreshSession(storedSession)
      : of(storedSession);

    return session$.pipe(
      switchMap((session) => this.loadUserProfile(session)),
      catchError(() => {
        this.clearSessionIfCurrent(storedSession);
        return of(null);
      }),
      finalize(() => this.initializedSubject.next(true)),
    );
  }

  private loadUserProfile(session: AuthSession): Observable<UserProfile> {
    return this.profileRepository.findByUid(session.uid, session.idToken).pipe(
      tap((profile) => {
        if (profile.status !== 'active') {
          throw new Error('La cuenta está inactiva. Contacta al administrador.');
        }

        this.sessionStorage.setSession(session);
        this.sessionSubject.next(session);
        this.profileSubject.next(profile);
      }),
    );
  }

  private clearSession(): void {
    this.sessionStorage.clearSession();
    this.sessionSubject.next(null);
    this.profileSubject.next(null);
  }

  private clearSessionIfCurrent(session: AuthSession): void {
    const currentSession = this.sessionStorage.getSession();

    if (currentSession && this.isSameSession(currentSession, session)) {
      this.clearSession();
    }
  }

  private isSameSession(currentSession: AuthSession, expectedSession: AuthSession): boolean {
    return currentSession.uid === expectedSession.uid && currentSession.refreshToken === expectedSession.refreshToken;
  }

  private isExpired(session: AuthSession): boolean {
    const refreshThresholdMilliseconds = 60_000;
    return session.expiresAt - refreshThresholdMilliseconds <= Date.now();
  }
}
