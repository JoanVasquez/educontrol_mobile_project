import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ValidAuthSessionService } from '../auth/valid-auth-session.service';
import type { Breakdown, BreakdownDTO } from '../models/breakdown.model';

interface FirestoreValue {
  stringValue?: string;
  timestampValue?: string;
  nullValue?: 'NULL_VALUE';
}

interface FirestoreBreakdownPayload {
  fields: Record<keyof BreakdownDTO, FirestoreValue>;
}

interface FirestoreDocumentResponse {
  name: string;
  fields?: Partial<Record<keyof BreakdownDTO, FirestoreValue>>;
}

@Injectable({
  providedIn: 'root',
})
export class BreakdownService {
  private readonly http = inject(HttpClient);
  private readonly authSession = inject(ValidAuthSessionService);
  private readonly projectId = environment.firebase.projectId;
  private readonly collectionName = 'breakdowns';

  createBreakdown(breakdown: Breakdown, documentId: string = this.createDocumentId()): Observable<Breakdown> {
    return this.withIdToken().pipe(
      switchMap((idToken) =>
        this.http.patch<FirestoreDocumentResponse>(this.documentUrl(documentId), this.mapToPayload(breakdown), {
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

  getAllBreakdowns(): Observable<Breakdown[]> {
    return this.withIdToken().pipe(
      switchMap((idToken) =>
        this.http.get<{ documents?: FirestoreDocumentResponse[] }>(this.collectionUrl(), {
          headers: this.authHeaders(idToken),
        }),
      ),
      map((response) => (response.documents || []).map((document) => this.mapFromDocument(document))),
    );
  }

  updateBreakdown(id: string, updates: Partial<Breakdown>): Observable<void> {
    const payload = this.mapPartialToPayload({ ...updates, updatedAt: new Date().toISOString() });

    return this.withIdToken().pipe(
      switchMap((idToken) =>
        this.http.patch<unknown>(this.documentUrl(id), payload, {
          headers: this.authHeaders(idToken),
        }),
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

  private mapFromDocument(document: FirestoreDocumentResponse): Breakdown {
    const fields = document.fields || {};

    return {
      id: document.name.split('/').pop(),
      category: String(fields.category?.stringValue || 'Otra') as Breakdown['category'],
      description: String(fields.description?.stringValue || ''),
      priority: String(fields.priority?.stringValue || 'low') as Breakdown['priority'],
      location: String(fields.location?.stringValue || ''),
      photoUrl: fields.photoUrl?.stringValue || null,
      photoDataUrl: fields.photoDataUrl?.stringValue || null,
      photoName: fields.photoName?.stringValue || null,
      photoContentType: fields.photoContentType?.stringValue || null,
      status: String(fields.status?.stringValue || 'pending') as Breakdown['status'],
      createdAt: String(fields.createdAt?.timestampValue || new Date().toISOString()),
      updatedAt: fields.updatedAt?.timestampValue,
    };
  }

  private mapToPayload(breakdown: Breakdown): FirestoreBreakdownPayload {
    return {
      fields: {
        category: { stringValue: breakdown.category },
        description: { stringValue: breakdown.description },
        priority: { stringValue: breakdown.priority },
        location: { stringValue: breakdown.location },
        photoUrl: this.nullableString(breakdown.photoUrl),
        photoDataUrl: this.nullableString(breakdown.photoDataUrl),
        photoName: this.nullableString(breakdown.photoName),
        photoContentType: this.nullableString(breakdown.photoContentType),
        status: { stringValue: breakdown.status },
        createdAt: { timestampValue: breakdown.createdAt },
        updatedAt: { timestampValue: breakdown.updatedAt || breakdown.createdAt },
      },
    };
  }

  private mapPartialToPayload(breakdown: Partial<Breakdown>): { fields: Record<string, FirestoreValue> } {
    const fields: Record<string, FirestoreValue> = {};

    if (breakdown.category) fields['category'] = { stringValue: breakdown.category };
    if (breakdown.description) fields['description'] = { stringValue: breakdown.description };
    if (breakdown.priority) fields['priority'] = { stringValue: breakdown.priority };
    if (breakdown.location) fields['location'] = { stringValue: breakdown.location };
    if (breakdown.status) fields['status'] = { stringValue: breakdown.status };
    if (breakdown.photoUrl !== undefined) fields['photoUrl'] = this.nullableString(breakdown.photoUrl);
    if (breakdown.photoDataUrl !== undefined) fields['photoDataUrl'] = this.nullableString(breakdown.photoDataUrl);
    if (breakdown.photoName !== undefined) fields['photoName'] = this.nullableString(breakdown.photoName);
    if (breakdown.photoContentType !== undefined) {
      fields['photoContentType'] = this.nullableString(breakdown.photoContentType);
    }
    if (breakdown.createdAt) fields['createdAt'] = { timestampValue: breakdown.createdAt };
    if (breakdown.updatedAt) fields['updatedAt'] = { timestampValue: breakdown.updatedAt };

    return { fields };
  }

  private nullableString(value: string | null | undefined): FirestoreValue {
    return value ? { stringValue: value } : { nullValue: 'NULL_VALUE' };
  }
}
