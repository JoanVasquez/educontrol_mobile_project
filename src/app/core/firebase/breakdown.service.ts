import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ValidAuthSessionService } from '../auth/valid-auth-session.service';
import type { Breakdown } from '../models/breakdown.model';
import { FirestoreBreakdownMapper, type FirestoreDocumentResponse } from './firestore-breakdown.mapper';

@Injectable({
  providedIn: 'root',
})
export class BreakdownService {
  private readonly http = inject(HttpClient);
  private readonly authSession = inject(ValidAuthSessionService);
  private readonly projectId = environment.firebase.projectId;
  private readonly collectionName = 'breakdowns';
  private readonly mapper = new FirestoreBreakdownMapper();

  createBreakdown(breakdown: Breakdown, documentId: string = this.createDocumentId()): Observable<Breakdown> {
    return this.withIdToken().pipe(
      switchMap((idToken) =>
        this.http.patch<FirestoreDocumentResponse>(this.documentUrl(documentId), this.mapper.toPayload(breakdown), {
          headers: this.authHeaders(idToken),
        }),
      ),
      map(() => ({ ...breakdown, id: documentId })),
    );
  }

  getBreakdownsByLocation(location: string): Observable<Breakdown[]> {
    return this.getAllBreakdowns().pipe(
      map((breakdowns) => breakdowns.filter((breakdown) => breakdown.location === location)),
    );
  }

  getBreakdown(id: string): Observable<Breakdown> {
    return this.withIdToken().pipe(
      switchMap((idToken) =>
        this.http.get<FirestoreDocumentResponse>(this.documentUrl(id), {
          headers: this.authHeaders(idToken),
        }),
      ),
      map((document) => this.mapper.fromDocument(document)),
    );
  }

  getAllBreakdowns(): Observable<Breakdown[]> {
    return this.withIdToken().pipe(
      switchMap((idToken) =>
        this.http.get<{ documents?: FirestoreDocumentResponse[] }>(this.collectionUrl(), {
          headers: this.authHeaders(idToken),
        }),
      ),
      map((response) => (response.documents || []).map((document) => this.mapper.fromDocument(document))),
    );
  }

  updateBreakdown(id: string, updates: Partial<Breakdown>): Observable<void> {
    return this.getBreakdown(id).pipe(
      map((current) => ({
        ...current,
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      })),
      switchMap((updatedBreakdown) =>
        this.withIdToken().pipe(
          switchMap((token) =>
            this.http.patch<unknown>(this.documentUrl(id), this.mapper.toPayload(updatedBreakdown), {
              headers: this.authHeaders(token),
            }),
          ),
        ),
      ),
      map(() => undefined),
    );
  }

  deleteBreakdown(id: string): Observable<void> {
    return this.withIdToken().pipe(
      switchMap((idToken) =>
        this.http.delete<unknown>(this.documentUrl(id), {
          headers: this.authHeaders(idToken),
        }),
      ),
      map(() => undefined),
    );
  }

  createDocumentId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  private withIdToken(): Observable<string> {
    return this.authSession.get().pipe(
      switchMap((session) => {
        if (!session) {
          return throwError(() => new Error('Debes iniciar sesion para registrar averias.'));
        }

        return of(session.idToken);
      }),
    );
  }

  private collectionUrl(): string {
    return (
      'https://firestore.googleapis.com/v1/projects/' +
      this.projectId +
      '/databases/(default)/documents/' +
      this.collectionName
    );
  }

  private documentUrl(id: string): string {
    return this.collectionUrl() + '/' + encodeURIComponent(id);
  }

  private authHeaders(idToken: string): HttpHeaders {
    return new HttpHeaders({ Authorization: 'Bearer ' + idToken });
  }

}
