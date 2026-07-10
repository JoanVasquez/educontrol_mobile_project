import { TeacherFirestoreMapper } from './teacher-firestore.mapper';
import type { TeacherRegistrationDraft } from './teacher-registration.model';

describe('TeacherFirestoreMapper', () => {
  const teacher: TeacherRegistrationDraft = {
    firstName: 'Ana',
    lastName: 'Pérez',
    birthDate: '1990-01-01',
    nationality: 'Dominicana',
    gender: 'Femenino',
    idNumber: '001-0000000-1',
    address: 'Santo Domingo',
    phone: '809-555-0101',
    assignments: [{ subject: 'Matemáticas', detail: 'Álgebra' }],
    courses: [{ course: '3ro', section: 'A' }],
    photoUrl: 'https://example.com/photo.jpg',
    photoPath: 'docentes/id/perfil.jpg',
    status: 'active',
    createdAt: '2026-06-24T00:00:00.000Z',
    updatedAt: '2026-06-24T00:00:00.000Z',
  };

  it('maps the domain draft to Firestore REST fields', () => {
    const payload = new TeacherFirestoreMapper().toCreatePayload(teacher);

    expect(payload.fields.firstName).toEqual({ stringValue: 'Ana' });
    expect(payload.fields.status).toEqual({ stringValue: 'active' });
    expect(payload.fields.createdAt).toEqual({ timestampValue: teacher.createdAt });
    expect(payload.fields.assignments).toEqual({
      arrayValue: {
        values: [
          {
            mapValue: {
              fields: {
                subject: { stringValue: 'Matemáticas' },
                detail: { stringValue: 'Álgebra' },
              },
            },
          },
        ],
      },
    });
  });
});
