import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { combineLatest, map, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { getAcademicSubjectsByCourse, normalizeAcademicCourse } from '../academic/academic-course.catalog';
import type { UserProfile } from '../users/user-profile.model';
import type { StudentAcademicRecord } from './student-academic.model';
import { StudentAcademicRepository } from './student-academic.repository';

@Injectable({ providedIn: 'root' })
export class StudentAcademicService {
  private readonly authService = inject(AuthService);
  private readonly repository = inject(StudentAcademicRepository);

  load(): Observable<StudentAcademicRecord[]> {
    return this.sessionContext().pipe(
      switchMap(({ idToken }) => this.repository.findAll(idToken)),
      map((students) =>
        students.map((student) => ({
          ...student,
          course: normalizeAcademicCourse(student.course),
          subjects: student.subjects.length ? student.subjects : getAcademicSubjectsByCourse(student.course),
        })),
      ),
    );
  }

  changeCourse(studentId: string, course: string): Observable<unknown> {
    const normalizedCourse = normalizeAcademicCourse(course);
    const subjects = getAcademicSubjectsByCourse(normalizedCourse);

    if (!subjects.length) {
      return throwError(() => new Error('Selecciona un curso valido.'));
    }

    return this.sessionContext().pipe(
      switchMap(({ idToken, profile }) => {
        if (!['admin', 'director'].includes(profile.role)) {
          return throwError(() => new Error('Solo el admin o director puede cambiar el curso del estudiante.'));
        }

        return this.repository.updateCourse(
          studentId,
          {
            course: normalizedCourse,
            subjects,
            updatedAt: new Date().toISOString(),
          },
          idToken,
        );
      }),
    );
  }

  private sessionContext(): Observable<{ idToken: string; profile: UserProfile }> {
    return combineLatest([this.authService.session$, this.authService.profile$]).pipe(
      take(1),
      map(([session, profile]) => {
        if (!session || !profile) {
          throw new Error('No hay una sesion activa.');
        }

        return { idToken: session.idToken, profile };
      }),
    );
  }
}
