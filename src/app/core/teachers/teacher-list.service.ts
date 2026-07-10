import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { catchError, map, of, switchMap, throwError } from 'rxjs';
import { ValidAuthSessionService } from '../auth/valid-auth-session.service';
import { TeacherCacheRepository } from './teacher-cache.repository';
import { TeacherListPresenter } from './teacher-list.presenter';
import type { TeacherListResult } from './teacher.model';
import { TeacherQueryRepository } from './teacher-query.repository';

@Injectable({ providedIn: 'root' })
export class TeacherListService {
  private readonly validSession = inject(ValidAuthSessionService);
  private readonly remoteRepository = inject(TeacherQueryRepository);
  private readonly cacheRepository = inject(TeacherCacheRepository);
  private readonly presenter = new TeacherListPresenter();

  load(): Observable<TeacherListResult> {
    return this.validSession.get().pipe(
      switchMap((session) => {
        if (!session) {
          return this.fromCacheOrError('No hay una sesión válida para consultar docentes.');
        }

        return this.remoteRepository.findAll(session.idToken).pipe(
          map((teachers) => {
            this.cacheRepository.replaceAll(teachers);
            return {
              teachers: teachers.map((teacher) => this.presenter.toListItem(teacher)),
              source: 'remote' as const,
            };
          }),
          catchError(() => this.fromCacheOrError('No se pudo consultar el listado de docentes en Firebase.')),
        );
      }),
    );
  }

  private fromCacheOrError(message: string): Observable<TeacherListResult> {
    const cachedTeachers = this.cacheRepository.getAll();

    if (!cachedTeachers.length) {
      return throwError(() => new Error(message));
    }

    return of({
      teachers: cachedTeachers.map((teacher) => this.presenter.toListItem(teacher)),
      source: 'cache',
    });
  }
}
