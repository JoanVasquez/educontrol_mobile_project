import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { combineLatest, map, switchMap, take } from 'rxjs';
import {
  getAcademicSubjectsByCourse,
  normalizeAcademicCourse,
  normalizeAcademicSubjects,
  normalizeCourseAssignments,
} from '../academic/academic-course.catalog';
import { AuthService } from '../auth/auth.service';
import { TeacherQueryRepository } from '../teachers/teacher-query.repository';
import type { UserProfile } from '../users/user-profile.model';
import type { AttendanceAccessContext } from './attendance-access.model';

@Injectable({ providedIn: 'root' })
export class AttendanceAccessService {
  private readonly authService = inject(AuthService);
  private readonly teacherQueryRepository = inject(TeacherQueryRepository);

  load(idToken: string): Observable<AttendanceAccessContext> {
    return this.currentProfile().pipe(
      switchMap((profile) => {
        if (profile.role === 'admin' || profile.role === 'director') {
          return [
            {
              unrestricted: true,
              courses: [],
              subjects: [],
            },
          ];
        }

        return this.teacherQueryRepository.findAll(idToken).pipe(
          map((teachers) => {
            const teacher = teachers.find((item) => item.authUid === profile.uid || item.email === profile.email);

            if (!teacher) {
              throw new Error('No se encontro el docente vinculado a tu usuario.');
            }

            return {
              unrestricted: false,
              courses: normalizeCourseAssignments(teacher.courses).map((item) => item.course),
              subjects: normalizeAcademicSubjects(teacher.assignments.map((item) => item.subject)),
            };
          }),
        );
      }),
    );
  }

  coursesForStudents(studentCourses: string[], access: AttendanceAccessContext): string[] {
    const courses = studentCourses.map((course) => normalizeAcademicCourse(course));
    const allowedCourses = access.unrestricted ? courses : courses.filter((course) => access.courses.includes(course));

    return [...new Set(allowedCourses)].sort((a, b) => a.localeCompare(b, 'es'));
  }

  subjectsForCourse(course: string, access: AttendanceAccessContext): string[] {
    const courseSubjects = getAcademicSubjectsByCourse(course);

    if (access.unrestricted) {
      return courseSubjects;
    }

    return courseSubjects.filter((subject) => access.subjects.includes(subject));
  }

  canAccess(course: string, subject: string, access: AttendanceAccessContext): boolean {
    if (access.unrestricted) {
      return Boolean(course && subject);
    }

    return access.courses.includes(normalizeAcademicCourse(course)) && access.subjects.includes(subject);
  }

  private currentProfile(): Observable<UserProfile> {
    return combineLatest([this.authService.profile$]).pipe(
      take(1),
      map(([profile]) => {
        if (!profile) {
          throw new Error('No hay un perfil activo para consultar permisos de asistencia.');
        }

        return profile;
      }),
    );
  }
}
