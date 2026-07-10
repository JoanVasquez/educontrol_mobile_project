import type { FirestoreDocument } from './attendance-firestore.model';
import type { AttendanceStudent } from './attendance.model';

export class AttendanceStudentMapper {
  fromDocument(document: FirestoreDocument): AttendanceStudent {
    const fields = document.fields ?? {};
    const firstName = fields['nombres']?.stringValue?.trim() ?? '';
    const lastName = fields['apellidos']?.stringValue?.trim() ?? '';

    return {
      id: document.name.split('/').pop() ?? '',
      fullName: `${firstName} ${lastName}`.trim(),
      course: fields['curso']?.stringValue?.trim() ?? '',
      photoUrl: fields['fotoUrl']?.stringValue?.trim() ?? '',
      status: null,
    };
  }

  isActive(document: FirestoreDocument): boolean {
    const status = document.fields?.['estado']?.stringValue?.toLowerCase().trim() ?? '';
    return status !== 'inactivo' && status !== 'inactive';
  }
}
