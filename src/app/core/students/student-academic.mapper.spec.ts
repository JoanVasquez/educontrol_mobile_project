import type { FirestoreDocument } from '../attendance/attendance-firestore.model';
import { StudentAcademicMapper } from './student-academic.mapper';

describe('StudentAcademicMapper', () => {
  const mapper = new StudentAcademicMapper();

  it('maps Firestore documents to academic records', () => {
    const document: FirestoreDocument = {
      name: 'projects/demo/databases/(default)/documents/students/student-1',
      fields: {
        nombres: { stringValue: ' Ana ' },
        apellidos: { stringValue: ' Pérez ' },
        curso: { stringValue: ' 1ro A ' },
        asignaturas: { arrayValue: { values: [{ stringValue: ' Matemática ' }, { stringValue: ' ' }] } },
        estado: { stringValue: 'activo' },
        updatedAt: { timestampValue: '2026-07-15T10:00:00.000Z' },
      },
    };

    expect(mapper.fromDocument(document)).toEqual({
      id: 'student-1',
      fullName: 'Ana Pérez',
      course: '1ro A',
      subjects: ['Matemática'],
      status: 'activo',
      updatedAt: '2026-07-15T10:00:00.000Z',
    });
  });

  it('maps course updates to Firestore payloads', () => {
    expect(mapper.toStudentCourseUpdatePayload({
      course: '2do B',
      subjects: ['Lengua', 'Sociales'],
      updatedAt: '2026-07-15T11:00:00.000Z',
    })).toEqual({
      fields: {
        curso: { stringValue: '2do B' },
        asignaturas: {
          arrayValue: {
            values: [{ stringValue: 'Lengua' }, { stringValue: 'Sociales' }],
          },
        },
        updatedAt: { timestampValue: '2026-07-15T11:00:00.000Z' },
      },
    });
  });
});
