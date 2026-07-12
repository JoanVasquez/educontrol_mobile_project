import type { FirestoreTeacherDocument, FirestoreValue } from '../teacher-document.mapper';
import type { TeacherRegistrationDraft } from '../teacher-registration.model';
import type { EditableTeacher } from './teacher-editor.model';

export class TeacherEditorMapper {
  fromDocument(document: FirestoreTeacherDocument): EditableTeacher {
    const fields = document.fields ?? {};

    return {
      id: document.name.split('/').pop() ?? '',
      email: this.string(fields, 'email'),
      authUid: this.string(fields, 'authUid'),
      firstName: this.string(fields, 'firstName'),
      lastName: this.string(fields, 'lastName'),
      birthDate: this.string(fields, 'birthDate'),
      nationality: this.string(fields, 'nationality'),
      gender: this.string(fields, 'gender'),
      idNumber: this.string(fields, 'idNumber'),
      address: this.string(fields, 'address'),
      phone: this.string(fields, 'phone'),
      assignments: (fields['assignments']?.arrayValue?.values ?? []).map((item) => ({
        subject: item.mapValue?.fields?.['subject']?.stringValue?.trim() ?? '',
        detail: item.mapValue?.fields?.['detail']?.stringValue?.trim() ?? '',
      })),
      courses: (fields['courses']?.arrayValue?.values ?? []).map((item) => ({
        course: item.mapValue?.fields?.['course']?.stringValue?.trim() ?? '',
        section: item.mapValue?.fields?.['section']?.stringValue?.trim() ?? '',
      })),
      photoUrl: this.string(fields, 'photoUrl'),
      photoPath: this.string(fields, 'photoPath'),
      status: 'active',
      createdAt: fields['createdAt']?.timestampValue ?? new Date().toISOString(),
      updatedAt: fields['updatedAt']?.timestampValue ?? new Date().toISOString(),
    };
  }

  toDraft(teacher: EditableTeacher): TeacherRegistrationDraft {
    return {
      email: teacher.email,
      authUid: teacher.authUid,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      birthDate: teacher.birthDate,
      nationality: teacher.nationality,
      gender: teacher.gender,
      idNumber: teacher.idNumber,
      address: teacher.address,
      phone: teacher.phone,
      assignments: teacher.assignments,
      courses: teacher.courses,
      photoUrl: teacher.photoUrl,
      photoPath: teacher.photoPath,
      status: teacher.status,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    };
  }

  private string(fields: Record<string, FirestoreValue>, key: string): string {
    return fields[key]?.stringValue?.trim() ?? '';
  }
}
