import type { StudentRegistrationDraft } from './student-registration.model';
import { StudentFirestoreMapper } from './student-firestore.mapper';

describe('StudentFirestoreMapper', () => {
  const mapper = new StudentFirestoreMapper();

  it('maps student subjects as a Firestore string array', () => {
    const student: StudentRegistrationDraft = {
      nombres: 'Ana',
      apellidos: 'Perez',
      fechaNacimiento: '2016-05-10',
      nacionalidad: 'Dominicana',
      genero: 'Femenino',
      curso: 'Tercero',
      asignaturas: ['Lengua Espanola', 'Matematica'],
      nombreMadre: 'Maria Perez',
      cedulaMadre: '00100000000',
      nombrePadre: 'Jose Perez',
      cedulaPadre: '00100000001',
      direccion: 'Calle 1',
      telefonoContacto: '8090000000',
      fotoUrl: '',
      estado: 'activo',
      createdAt: '2026-07-12T10:00:00.000Z',
      updatedAt: '2026-07-12T10:00:00.000Z',
    };

    expect(mapper.toCreatePayload(student).fields.asignaturas).toEqual({
      arrayValue: {
        values: [{ stringValue: 'Lengua Espanola' }, { stringValue: 'Matematica' }],
      },
    });
  });
});
