import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, EMPTY, catchError, firstValueFrom, from, map, of, switchMap } from 'rxjs';
import { NetworkService } from '../../detector_red/network.service';
import { FirebaseAuthApiService } from '../auth/firebase-auth-api.service';
import { ValidAuthSessionService } from '../auth/valid-auth-session.service';
import { DOMAIN_EVENTS } from '../events/domain-event.constants';
import { DomainEventBusService } from '../events/domain-event-bus.service';
import { toLoggableError } from '../utils/loggable-error.util';
import { PendingTeacherRepository } from './pending-teacher.repository';
import { TeacherPhotoRepository } from './teacher-photo.repository';
import { TeacherAccessRepository } from './teacher-access.repository';
import { DEFAULT_TEACHER_PASSWORD } from './teacher-access.constants';
import { teacherRegistrationRejectionReason } from './teacher-registration-error.util';
import type {
  PendingTeacherRegistration,
  RegisterTeacherResult,
  TeacherRegistrationCommand,
  TeacherRegistrationDraft,
} from './teacher-registration.model';
import { TeacherRemoteRepository } from './teacher-remote.repository';

@Injectable({ providedIn: 'root' })
export class TeacherRegistrationService {
  private readonly networkService = inject(NetworkService);
  private readonly pendingRepository = inject(PendingTeacherRepository);
  private readonly remoteRepository = inject(TeacherRemoteRepository);
  private readonly accessRepository = inject(TeacherAccessRepository);
  private readonly photoRepository = inject(TeacherPhotoRepository);
  private readonly authApi = inject(FirebaseAuthApiService);
  private readonly validSession = inject(ValidAuthSessionService);
  private readonly events = inject(DomainEventBusService);
  private readonly pendingCountSubject = new BehaviorSubject<number>(this.pendingRepository.count());

  private syncing = false;

  readonly pendingCount$ = this.pendingCountSubject.asObservable();

  constructor() {
    // Los docentes registrados sin conexion se crean en Firebase cuando vuelve la red.
    this.networkService.isOnline$.pipe(switchMap((isOnline) => (isOnline ? from(this.syncPending()) : EMPTY)), catchError(() => EMPTY)).subscribe();
  }

  register(command: TeacherRegistrationCommand): Observable<RegisterTeacherResult> {
    if (!this.networkService.isOnline) {
      return of(this.queue(command, 'offline'));
    }

    return this.validSession.get().pipe(
      switchMap((session) => {
        if (!session) {
          return of(this.queue(command, 'queued', 'auth-missing'));
        }

        return from(this.persist(command, session.idToken)).pipe(
          switchMap(() => from(this.syncPending())),
          map((pendingCount) => ({
            mode: 'online' as const,
            synced: true,
            pendingCount,
          })),
        );
      }),
      catchError((error) => {
        console.error('No se pudo registrar el docente en Firebase:', toLoggableError(error));
        const rejectionReason = teacherRegistrationRejectionReason(error);

        if (rejectionReason) {
          return of<RegisterTeacherResult>({
            mode: 'rejected',
            reason: rejectionReason,
            synced: false,
            pendingCount: this.pendingRepository.count(),
          });
        }

        return of(this.queue(command, 'queued', 'remote-error'));
      }),
    );
  }

  async syncPending(): Promise<number> {
    if (this.syncing || !this.networkService.isOnline) {
      return this.pendingRepository.count();
    }

    const session = await firstValueFrom(this.validSession.get());

    if (!session) {
      return this.pendingRepository.count();
    }

    this.syncing = true;
    const failedQueue: PendingTeacherRegistration[] = [];

    try {
      for (const pending of this.pendingRepository.getAll()) {
        try {
          await this.persist(pending.command, session.idToken);
        } catch (error) {
          console.error('No se pudo sincronizar docente pendiente:', toLoggableError(error));
          failedQueue.push(pending);
        }
      }
    } finally {
      this.pendingRepository.replaceAll(failedQueue);
      this.pendingCountSubject.next(failedQueue.length);
      this.syncing = false;
    }

    return failedQueue.length;
  }

  private async persist(command: TeacherRegistrationCommand, idToken: string): Promise<void> {
    // La clave por defecto solo se usa internamente para crear la cuenta; nunca se expone en UI.
    const teacherAccount = await firstValueFrom(
      this.authApi.createUserWithEmailAndPassword(command.teacher.email, DEFAULT_TEACHER_PASSWORD),
    );
    let teacher: TeacherRegistrationDraft = { ...command.teacher, authUid: teacherAccount.uid };

    if (command.photo) {
      // La foto se sube antes de guardar el docente para persistir path y URL juntos.
      const uploadedPhoto = await firstValueFrom(this.photoRepository.upload(command.photo, command.registrationId, idToken));
      teacher = {
        ...teacher,
        photoPath: uploadedPhoto.path,
        photoUrl: uploadedPhoto.url,
      };
    }

    await firstValueFrom(this.remoteRepository.save(command.registrationId, teacher, idToken));
    await firstValueFrom(
      this.accessRepository.saveUserProfile(
        {
          uid: teacherAccount.uid,
          email: teacher.email,
          fullName: `${teacher.firstName} ${teacher.lastName}`.trim(),
          codigo: command.userProfile.codigo,
          institucion: command.userProfile.institucion,
          distrito: command.userProfile.distrito,
          createdAt: teacher.createdAt,
          updatedAt: teacher.updatedAt,
        },
        idToken,
      ),
    );
    this.publishChanged(command.registrationId);
  }

  private queue(
    command: TeacherRegistrationCommand,
    mode: 'offline' | 'queued',
    reason?: 'auth-missing' | 'auth-user-exists' | 'remote-error',
  ): RegisterTeacherResult {
    // Si hay fallos recuperables, conservamos el comando completo para reintentar despues.
    const queue = this.pendingRepository.add(command);
    this.pendingCountSubject.next(queue.length);
    this.publishChanged(command.registrationId);

    return { mode, reason, synced: false, pendingCount: queue.length };
  }

  private publishChanged(id: string): void {
    this.events.publish(DOMAIN_EVENTS.teacherChanged, { id });
  }
}
