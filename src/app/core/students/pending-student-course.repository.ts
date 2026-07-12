import { Injectable } from '@angular/core';
import type { PendingStudentCourseUpdate, StudentCourseUpdate } from './student-academic.model';

const PENDING_STUDENT_COURSES_KEY = 'educontrol.pending.student-course-updates';

@Injectable({ providedIn: 'root' })
export class PendingStudentCourseRepository {
  getAll(): PendingStudentCourseUpdate[] {
    const rawQueue = localStorage.getItem(PENDING_STUDENT_COURSES_KEY);

    if (!rawQueue) {
      return [];
    }

    try {
      return JSON.parse(rawQueue) as PendingStudentCourseUpdate[];
    } catch {
      this.replaceAll([]);
      return [];
    }
  }

  upsert(studentId: string, update: StudentCourseUpdate): PendingStudentCourseUpdate[] {
    const now = new Date().toISOString();
    const existing = this.getAll();
    const previous = existing.find((item) => item.studentId === studentId);
    const pendingUpdate: PendingStudentCourseUpdate = {
      localId: previous?.localId || crypto.randomUUID(),
      studentId,
      update,
      createdAt: previous?.createdAt || now,
      updatedAt: now,
    };
    const queue = [
      ...existing.filter((item) => item.studentId !== studentId),
      pendingUpdate,
    ];

    this.replaceAll(queue);
    return queue;
  }

  replaceAll(queue: PendingStudentCourseUpdate[]): void {
    localStorage.setItem(PENDING_STUDENT_COURSES_KEY, JSON.stringify(queue));
  }

  removeByStudentId(studentId: string): PendingStudentCourseUpdate[] {
    const queue = this.getAll().filter((item) => item.studentId !== studentId);
    this.replaceAll(queue);
    return queue;
  }

  count(): number {
    return this.getAll().length;
  }
}
