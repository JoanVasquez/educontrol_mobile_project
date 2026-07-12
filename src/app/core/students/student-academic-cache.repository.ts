import { Injectable } from '@angular/core';
import type { StudentAcademicRecord, StudentCourseUpdate } from './student-academic.model';

const STUDENT_ACADEMIC_CACHE_KEY = 'educontrol.cache.student-academic-records';

@Injectable({ providedIn: 'root' })
export class StudentAcademicCacheRepository {
  getAll(): StudentAcademicRecord[] {
    const rawRecords = localStorage.getItem(STUDENT_ACADEMIC_CACHE_KEY);

    if (!rawRecords) {
      return [];
    }

    try {
      return JSON.parse(rawRecords) as StudentAcademicRecord[];
    } catch {
      this.replaceAll([]);
      return [];
    }
  }

  replaceAll(students: StudentAcademicRecord[]): void {
    localStorage.setItem(STUDENT_ACADEMIC_CACHE_KEY, JSON.stringify(students));
  }

  applyCourseUpdate(studentId: string, update: StudentCourseUpdate): StudentAcademicRecord[] {
    const students = this.getAll().map((student) =>
      student.id === studentId
        ? {
            ...student,
            course: update.course,
            subjects: update.subjects,
            updatedAt: update.updatedAt,
          }
        : student,
    );

    this.replaceAll(students);
    return students;
  }
}
