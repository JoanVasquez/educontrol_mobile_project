import { Injectable } from '@angular/core';
import { getAcademicSubjectsByCourse, normalizeAcademicCourse } from '../academic/academic-course.catalog';
import type { PendingStudentCourseUpdate, StudentAcademicRecord } from './student-academic.model';

@Injectable({ providedIn: 'root' })
export class StudentAcademicPresenter {
  normalize(students: StudentAcademicRecord[]): StudentAcademicRecord[] {
    return students.map((student) => ({
      ...student,
      course: normalizeAcademicCourse(student.course),
      subjects: student.subjects.length ? student.subjects : getAcademicSubjectsByCourse(student.course),
    }));
  }

  mergePendingUpdates(
    students: StudentAcademicRecord[],
    pendingUpdates: PendingStudentCourseUpdate[],
  ): StudentAcademicRecord[] {
    const pendingByStudentId = new Map(pendingUpdates.map((item) => [item.studentId, item.update]));

    return students.map((student) => {
      const pendingUpdate = pendingByStudentId.get(student.id);

      return pendingUpdate
        ? {
            ...student,
            course: pendingUpdate.course,
            subjects: pendingUpdate.subjects,
            updatedAt: pendingUpdate.updatedAt,
          }
        : student;
    });
  }
}
