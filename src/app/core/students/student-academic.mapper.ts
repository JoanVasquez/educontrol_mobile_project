import type { FirestoreDocument, FirestoreValue } from '../attendance/attendance-firestore.model';
import type { StudentAcademicRecord, StudentCourseUpdate } from './student-academic.model';

type FirestoreStringField = { stringValue: string };
type FirestoreTimestampField = { timestampValue: string };
type FirestoreArrayField = { arrayValue: { values: FirestoreStringField[] } };

export class StudentAcademicMapper {
  fromDocument(document: FirestoreDocument): StudentAcademicRecord {
    const fields = document.fields ?? {};
    const firstName = this.string(fields, 'nombres');
    const lastName = this.string(fields, 'apellidos');

    return {
      id: document.name.split('/').pop() ?? '',
      fullName: `${firstName} ${lastName}`.trim(),
      course: this.string(fields, 'curso'),
      subjects: this.strings(fields['asignaturas']),
      status: this.string(fields, 'estado'),
      updatedAt: fields['updatedAt']?.timestampValue ?? '',
    };
  }

  toStudentCourseUpdatePayload(update: StudentCourseUpdate): {
    fields: {
      curso: FirestoreStringField;
      asignaturas: FirestoreArrayField;
      updatedAt: FirestoreTimestampField;
    };
  } {
    return {
      fields: {
        curso: { stringValue: update.course },
        asignaturas: {
          arrayValue: {
            values: update.subjects.map((subject) => ({ stringValue: subject })),
          },
        },
        updatedAt: { timestampValue: update.updatedAt },
      },
    };
  }

  private string(fields: Record<string, FirestoreValue>, key: string): string {
    return fields[key]?.stringValue?.trim() ?? '';
  }

  private strings(value: FirestoreValue | undefined): string[] {
    return (value?.arrayValue?.values ?? [])
      .map((item) => item.stringValue?.trim() ?? '')
      .filter(Boolean);
  }
}
