import { TestBed } from '@angular/core/testing';
import type { TeacherRegistrationCommand } from './teacher-registration.model';
import { PendingTeacherRepository } from './pending-teacher.repository';

describe('PendingTeacherRepository', () => {
  let repository: PendingTeacherRepository;

  const command: TeacherRegistrationCommand = {
    registrationId: 'teacher-id',
    teacher: {
      email: 'ana@example.com',
      authUid: '',
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
    userProfile: {
      codigo: 'DOC-001',
      institucion: 'Centro Educativo Demo',
      distrito: '10-02',
    },
    photo: null,
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [PendingTeacherRepository] });
    repository = TestBed.inject(PendingTeacherRepository);
  });

  it('queues and restores a teacher registration', () => {
    const queue = repository.add(command);

    expect(queue.length).toBe(1);
    expect(repository.count()).toBe(1);
    expect(repository.getAll()[0].command.teacher.firstName).toBe('Ana');
  });
});
