import type { StudentRegistrationDraft } from './student-registration.model';

type FirestoreStringField = { stringValue: string };
type FirestoreTimestampField = { timestampValue: string };
type FirestoreField = FirestoreStringField | FirestoreTimestampField;

interface FirestoreCreateStudentPayload {
  fields: Record<keyof StudentRegistrationDraft, FirestoreField>;
}

export class StudentFirestoreMapper {
  toCreatePayload(student: StudentRegistrationDraft): FirestoreCreateStudentPayload {
    return {
      fields: {
        nombres: { stringValue: student.nombres },
        apellidos: { stringValue: student.apellidos },
        cedulaMadre: { stringValue: student.cedulaMadre },
        cedulaPadre: { stringValue: student.cedulaPadre },
        createdAt: { timestampValue: student.createdAt },
        curso: { stringValue: student.curso },
        direccion: { stringValue: student.direccion },
        estado: { stringValue: student.estado },
        fechaNacimiento: { stringValue: student.fechaNacimiento },
        fotoUrl: { stringValue: student.fotoUrl },
        genero: { stringValue: student.genero },
        nacionalidad: { stringValue: student.nacionalidad },
        nombreMadre: { stringValue: student.nombreMadre },
        nombrePadre: { stringValue: student.nombrePadre },
        telefonoContacto: { stringValue: student.telefonoContacto },
        updatedAt: { timestampValue: student.updatedAt },
      },
    };
  }
}
