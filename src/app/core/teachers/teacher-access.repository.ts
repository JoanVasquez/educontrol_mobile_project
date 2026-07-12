import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TeacherUserProfileDraft {
  uid: string;
  email: string;
  fullName: string;
  codigo: string;
  institucion: string;
  distrito: string;
  createdAt: string;
  updatedAt: string;
}

type FirestoreValue = { stringValue: string } | { timestampValue: string };

@Injectable({ providedIn: 'root' })
export class TeacherAccessRepository {
  private readonly http = inject(HttpClient);
  private readonly projectId = environment.firebase.projectId;

  saveUserProfile(profile: TeacherUserProfileDraft, idToken: string): Observable<unknown> {
    const url =
      `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/` +
      `user/${encodeURIComponent(profile.uid)}`;

    return this.http.patch(
      url,
      {
        fields: this.toPayload(profile),
      },
      {
        headers: { Authorization: `Bearer ${idToken}` },
      },
    );
  }

  private toPayload(profile: TeacherUserProfileDraft): Record<string, FirestoreValue> {
    return {
      email: { stringValue: profile.email },
      fullName: { stringValue: profile.fullName },
      role: { stringValue: 'docente' },
      codigo: { stringValue: profile.codigo },
      institucion: { stringValue: profile.institucion },
      distrito: { stringValue: profile.distrito },
      status: { stringValue: 'active' },
      createdAt: { timestampValue: profile.createdAt },
      updatedAt: { timestampValue: profile.updatedAt },
    };
  }
}
