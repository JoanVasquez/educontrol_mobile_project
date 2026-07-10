import { Injectable } from '@angular/core';
import type { PendingTeacherRegistration, TeacherRegistrationCommand } from './teacher-registration.model';

const PENDING_TEACHERS_KEY = 'educontrol.pending.teacher-registrations';

@Injectable({ providedIn: 'root' })
export class PendingTeacherRepository {
  getAll(): PendingTeacherRegistration[] {
    const rawQueue = localStorage.getItem(PENDING_TEACHERS_KEY);

    if (!rawQueue) {
      return [];
    }

    try {
      return JSON.parse(rawQueue) as PendingTeacherRegistration[];
    } catch {
      this.replaceAll([]);
      return [];
    }
  }

  add(command: TeacherRegistrationCommand): PendingTeacherRegistration[] {
    const queue = [
      ...this.getAll(),
      {
        localId: crypto.randomUUID(),
        command,
        createdAt: new Date().toISOString(),
      },
    ];

    this.replaceAll(queue);
    return queue;
  }

  replaceAll(queue: PendingTeacherRegistration[]): void {
    localStorage.setItem(PENDING_TEACHERS_KEY, JSON.stringify(queue));
  }

  count(): number {
    return this.getAll().length;
  }
}
