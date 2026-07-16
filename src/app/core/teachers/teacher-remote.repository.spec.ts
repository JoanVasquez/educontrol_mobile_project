import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { TeacherRegistrationDraft } from './teacher-registration.model';
import { TeacherRemoteRepository } from './teacher-remote.repository';

describe('TeacherRemoteRepository', () => {
  let repository: TeacherRemoteRepository;
  let httpTesting: HttpTestingController;

  const teacher: TeacherRegistrationDraft = {
    email: 'ana@example.com',
    authUid: 'teacher-auth-uid',
    firstName: 'Ana',
    lastName: 'Pérez',
    birthDate: '1990-01-01',
    nationality: 'Dominicana',
    gender: 'Femenino',
    idNumber: '001-0000000-1',
    address: 'Santo Domingo',
    phone: '809-555-0101',
    assignments: [],
    courses: [],
    photoUrl: '',
    photoPath: '',
    status: 'active',
    createdAt: '2026-06-24T00:00:00.000Z',
    updatedAt: '2026-06-24T00:00:00.000Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TeacherRemoteRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(TeacherRemoteRepository);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('saves a teacher using an authenticated deterministic document id', () => {
    repository.save('teacher-id', teacher, 'id-token').subscribe();

    const request = httpTesting.expectOne(
      'https://firestore.googleapis.com/v1/projects/educontrol-mobile/databases/(default)/documents/docentes/teacher-id',
    );
    expect(request.request.method).toBe('PATCH');
    expect(request.request.headers.get('Authorization')).toBe('Bearer id-token');
    expect(request.request.body.fields.firstName).toEqual({ stringValue: 'Ana' });
    request.flush({});
  });
});
