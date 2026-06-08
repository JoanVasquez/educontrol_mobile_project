import { Injectable } from '@angular/core';
import type { PendingStudentRegistration, StudentRegistrationDraft } from './student-registration.model';

const PENDING_STUDENTS_KEY = 'educontrol.pending.student-registrations';

@Injectable({ providedIn: 'root' })
export class PendingStudentStorageRepository {
  getAll(): PendingStudentRegistration[] {
    const rawQueue = localStorage.getItem(PENDING_STUDENTS_KEY);

    if (!rawQueue) {
      return [];
    }

    try {
      return JSON.parse(rawQueue) as PendingStudentRegistration[];
    } catch {
      this.replaceAll([]);
      return [];
    }
  }

  add(payload: StudentRegistrationDraft): PendingStudentRegistration[] {
    const queue = [
      ...this.getAll(),
      {
        localId: crypto.randomUUID(),
        payload,
        createdAt: new Date().toISOString(),
      },
    ];

    this.replaceAll(queue);
    return queue;
  }

  replaceAll(queue: PendingStudentRegistration[]): void {
    localStorage.setItem(PENDING_STUDENTS_KEY, JSON.stringify(queue));
  }

  count(): number {
    return this.getAll().length;
  }
}
