import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthSession } from './auth-session.model';

interface FirebaseSignInResponse {
  localId: string;
  email: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

interface FirebaseRefreshResponse {
  user_id: string;
  id_token: string;
  refresh_token: string;
  expires_in: string;
}

@Injectable({ providedIn: 'root' })
export class FirebaseAuthApiService {
  private readonly http = inject(HttpClient);
  private readonly apiKey = environment.firebase.apiKey;
  private readonly authUrl = 'https://identitytoolkit.googleapis.com/v1/accounts';
  private readonly tokenUrl = 'https://securetoken.googleapis.com/v1/token';

  signInWithEmailAndPassword(email: string, password: string): Observable<AuthSession> {
    return this.http
      .post<FirebaseSignInResponse>(`${this.authUrl}:signInWithPassword?key=${this.apiKey}`, {
        email,
        password,
        returnSecureToken: true,
      })
      .pipe(map((response) => this.toSession(response)));
  }

  refreshSession(session: AuthSession): Observable<AuthSession> {
    return this.http
      .post<FirebaseRefreshResponse>(`${this.tokenUrl}?key=${this.apiKey}`, {
        grant_type: 'refresh_token',
        refresh_token: session.refreshToken,
      })
      .pipe(
        map((response) => ({
          uid: response.user_id,
          email: session.email,
          idToken: response.id_token,
          refreshToken: response.refresh_token,
          expiresAt: this.getExpirationTimestamp(response.expires_in),
        })),
      );
  }

  private toSession(response: FirebaseSignInResponse): AuthSession {
    return {
      uid: response.localId,
      email: response.email,
      idToken: response.idToken,
      refreshToken: response.refreshToken,
      expiresAt: this.getExpirationTimestamp(response.expiresIn),
    };
  }

  private getExpirationTimestamp(expiresInSeconds: string): number {
    return Date.now() + Number(expiresInSeconds) * 1000;
  }
}
