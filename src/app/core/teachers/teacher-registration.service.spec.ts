import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { FirebaseAuthApiService } from '../auth/firebase-auth-api.service';
import type { AuthSession } from '../auth/auth-session.model';
import { SessionStorageService } from '../auth/session-storage.service';
import { NetworkService } from '../../detector_red/network.service';
import { PendingTeacherRepository } from './pending-teacher.repository';
import { TeacherPhotoRepository } from './teacher-photo.repository';
import type { TeacherRegistrationCommand } from './teacher-registration.model';
import { TeacherRegistrationService } from './teacher-registration.service';
import { TeacherRemoteRepository } from './teacher-remote.repository';

describe('TeacherRegistrationService', () => {
  let service: TeacherRegistrationService;
  let remoteRepository: jasmine.SpyObj<TeacherRemoteRepository>;
  let pendingRepository: jasmine.SpyObj<PendingTeacherRepository>;

  const session: AuthSession = {
    uid: 'user-id',
    email: 'admin@example.com',
    idToken: 'id-token',
    refreshToken: 'refresh-token',
    expiresAt: Date.now() + 3_600_000,
  };

  const command: TeacherRegistrationCommand = {
    registrationId: 'teacher-id',
    teacher: {
      firstName: 'Ana',
      lastName: 'Pérez',
      birthDate: '1990-01-01',
      nationality: 'Dominicana',
      gender: 'Femenino',
      idNumber: '001',
      address: 'Santo Domingo',
      phone: '809',
      assignments: [],
      courses: [],
      photoUrl: '',
      photoPath: '',
      status: 'active',
      createdAt: '2026-06-24T00:00:00.000Z',
      updatedAt: '2026-06-24T00:00:00.000Z',
    },
    photo: null,
  };

  beforeEach(() => {
    remoteRepository = jasmine.createSpyObj<TeacherRemoteRepository>('TeacherRemoteRepository', ['save']);
    pendingRepository = jasmine.createSpyObj<PendingTeacherRepository>('PendingTeacherRepository', ['add', 'count', 'getAll', 'replaceAll']);
    const photoRepository = jasmine.createSpyObj<TeacherPhotoRepository>('TeacherPhotoRepository', ['upload']);
    const authApi = jasmine.createSpyObj<FirebaseAuthApiService>('FirebaseAuthApiService', ['refreshSession']);
    const sessionStorage = jasmine.createSpyObj<SessionStorageService>('SessionStorageService', ['getSession', 'setSession']);
    const onlineSubject = new BehaviorSubject(true);
    const networkService = { isOnline: true, isOnline$: onlineSubject.asObservable() };

    pendingRepository.count.and.returnValue(0);
    pendingRepository.getAll.and.returnValue([]);
    remoteRepository.save.and.returnValue(of({}));
    sessionStorage.getSession.and.returnValue(session);

    TestBed.configureTestingModule({
      providers: [
        TeacherRegistrationService,
        { provide: TeacherRemoteRepository, useValue: remoteRepository },
        { provide: TeacherPhotoRepository, useValue: photoRepository },
        { provide: PendingTeacherRepository, useValue: pendingRepository },
        { provide: FirebaseAuthApiService, useValue: authApi },
        { provide: SessionStorageService, useValue: sessionStorage },
        { provide: NetworkService, useValue: networkService },
      ],
    });

    service = TestBed.inject(TeacherRegistrationService);
  });

  it('persists an online teacher and leaves the queue empty', (done) => {
    service.register(command).subscribe((result) => {
      expect(result.mode).toBe('online');
      expect(result.synced).toBeTrue();
      expect(remoteRepository.save).toHaveBeenCalledWith('teacher-id', command.teacher, 'id-token');
      expect(pendingRepository.add).not.toHaveBeenCalled();
      done();
    });
  });
});
