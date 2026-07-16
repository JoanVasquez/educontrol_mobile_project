import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { catchError, firstValueFrom, from, map, of, switchMap, throwError } from 'rxjs';
import { ValidAuthSessionService } from '../../auth/valid-auth-session.service';
import { DOMAIN_EVENTS } from '../../events/domain-event.constants';
import { DomainEventBusService } from '../../events/domain-event-bus.service';
import { TeacherCacheRepository } from '../teacher-cache.repository';
import { TeacherPhotoRepository } from '../teacher-photo.repository';
import type { SerializedTeacherPhoto } from '../teacher-registration.model';
import { TeacherEditorCacheRepository } from './teacher-editor-cache.repository';
import { TeacherEditorMapper } from './teacher-editor.mapper';
import type { EditableTeacher, TeacherEditorResult } from './teacher-editor.model';
import { TeacherEditorRepository } from './teacher-editor.repository';

@Injectable({ providedIn: 'root' })
export class TeacherEditorService {
  private readonly validSession = inject(ValidAuthSessionService);
  private readonly repository = inject(TeacherEditorRepository);
  private readonly photoRepository = inject(TeacherPhotoRepository);
  private readonly cacheRepository = inject(TeacherEditorCacheRepository);
  private readonly listCacheRepository = inject(TeacherCacheRepository);
  private readonly events = inject(DomainEventBusService);
  private readonly mapper = new TeacherEditorMapper();

  load(teacherId: string): Observable<TeacherEditorResult> {
    return this.validSession.get().pipe(
      switchMap((session) => {
        if (!session) return this.cachedOrError(teacherId, 'No hay una sesión válida para consultar el docente.');

        return this.repository.findById(teacherId, session.idToken).pipe(
          map((teacher) => {
            this.cacheRepository.save(teacher);
            return { teacher, source: 'remote' as const };
          }),
          catchError(() => this.cachedOrError(teacherId, 'No se pudo consultar el docente en Firebase.')),
        );
      }),
    );
  }

  update(teacher: EditableTeacher, photo: SerializedTeacherPhoto | null): Observable<EditableTeacher> {
    return this.validSession.get().pipe(
      switchMap((session) =>
        session
          ? from(this.persistUpdate(teacher, photo, session.idToken))
          : throwError(() => new Error('No hay una sesión válida para actualizar el docente.')),
      ),
    );
  }

  delete(teacher: EditableTeacher): Observable<void> {
    return this.validSession.get().pipe(
      switchMap((session) =>
        session
          ? from(this.persistDelete(teacher, session.idToken))
          : throwError(() => new Error('No hay una sesión válida para eliminar el docente.')),
      ),
    );
  }

  private async persistUpdate(
    teacher: EditableTeacher,
    photo: SerializedTeacherPhoto | null,
    idToken: string,
  ): Promise<EditableTeacher> {
    let updatedTeacher: EditableTeacher = {
      ...teacher,
      assignments: teacher.assignments.filter((item) => item.subject.trim()),
      courses: teacher.courses.filter((item) => item.course.trim()),
      updatedAt: new Date().toISOString(),
    };

    if (photo) {
      const uploadedPhoto = await firstValueFrom(this.photoRepository.upload(photo, teacher.id, idToken));
      updatedTeacher = { ...updatedTeacher, photoPath: uploadedPhoto.path, photoUrl: uploadedPhoto.url };
    }

    await firstValueFrom(this.repository.save(teacher.id, this.mapper.toDraft(updatedTeacher), idToken));

    if (photo && teacher.photoPath && teacher.photoPath !== updatedTeacher.photoPath) {
      await firstValueFrom(this.repository.deletePhoto(teacher.photoPath, idToken).pipe(catchError(() => of(null))));
    }

    this.cacheRepository.save(updatedTeacher);
    this.listCacheRepository.upsert({
      ...updatedTeacher,
      createdAt: new Date(updatedTeacher.createdAt),
      updatedAt: new Date(updatedTeacher.updatedAt),
    });
    this.events.publish(DOMAIN_EVENTS.teacherChanged, { id: updatedTeacher.id });
    return updatedTeacher;
  }

  private async persistDelete(teacher: EditableTeacher, idToken: string): Promise<void> {
    await firstValueFrom(this.repository.delete(teacher.id, idToken));
    if (teacher.photoPath) {
      await firstValueFrom(this.repository.deletePhoto(teacher.photoPath, idToken).pipe(catchError(() => of(null))));
    }
    this.cacheRepository.remove(teacher.id);
    this.listCacheRepository.remove(teacher.id);
    this.events.publish(DOMAIN_EVENTS.teacherChanged, { id: teacher.id, deleted: true });
  }

  private cachedOrError(teacherId: string, message: string): Observable<TeacherEditorResult> {
    const teacher = this.cacheRepository.findById(teacherId);
    return teacher ? of({ teacher, source: 'cache' }) : throwError(() => new Error(message));
  }
}
