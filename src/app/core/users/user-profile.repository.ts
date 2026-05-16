import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable} from 'rxjs';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { UserProfile, UserRole, UserStatus } from './user-profile.model';

interface FirestoreValue {
  stringValue?: string;
  timestampValue?: string;
}

interface FirestoreUserDocument {
  fields: Record<string, FirestoreValue>;
}

const USER_PROFILE_COLLECTION = 'user';

@Injectable({ providedIn: 'root' })
export class UserProfileRepository {
  private readonly http = inject(HttpClient);
  private readonly projectId = environment.firebase.projectId;

  findByUid(uid: string, idToken: string): Observable<UserProfile> {
    const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/${USER_PROFILE_COLLECTION}/${uid}`;

    return this.http
      .get<FirestoreUserDocument>(url, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      .pipe(map((document) => this.mapDocument(uid, document)));
  }

  private mapDocument(uid: string, document: FirestoreUserDocument): UserProfile {
    const fields = document.fields;

    return {
      uid,
      email: this.getString(fields, 'email'),
      fullName: this.getString(fields, 'fullName'),
      role: this.getString(fields, 'role').toLowerCase() as UserRole,
      status: this.getString(fields, 'status').toLowerCase() as UserStatus,
      createdAt: this.getTimestamp(fields, 'createdAt'),
      updatedAt: this.getTimestamp(fields, 'updatedAt'),
    };
  }

  private getString(fields: Record<string, FirestoreValue>, key: string): string {
    return fields[key]?.stringValue?.trim() ?? '';
  }

  private getTimestamp(fields: Record<string, FirestoreValue>, key: string): Date | undefined {
    const value = fields[key]?.timestampValue;
    return value ? new Date(value) : undefined;
  }
}
