import type { FirestoreDocument } from './attendance-firestore.model';
import { AttendanceStudentMapper } from './attendance-student.mapper';

describe('AttendanceStudentMapper', () => {
  const mapper = new AttendanceStudentMapper();

  it('maps a registered student document to the attendance model', () => {
    const document: FirestoreDocument = {
      name: 'projects/demo/databases/(default)/documents/estudiantes/student-1',
      fields: {
        nombres: { stringValue: ' Joan ' },
        apellidos: { stringValue: ' Vásquez ' },
        curso: { stringValue: 'Tercero' },
        fotoUrl: { stringValue: 'https://example.test/photo.jpg' },
        estado: { stringValue: 'activo' },
      },
    };

    expect(mapper.fromDocument(document)).toEqual({
      id: 'student-1',
      fullName: 'Joan Vásquez',
      course: 'Tercero',
      photoUrl: 'https://example.test/photo.jpg',
      status: null,
    });
    expect(mapper.isActive(document)).toBeTrue();
  });

  it('rejects inactive students', () => {
    expect(
      mapper.isActive({
        name: 'estudiantes/student-2',
        fields: { estado: { stringValue: 'inactivo' } },
      }),
    ).toBeFalse();
  });
});
