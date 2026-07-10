import type { TeacherAssignment, TeacherCourseAssignment } from './teacher-registration.model';
import type { Teacher } from './teacher.model';

export interface FirestoreValue {
  stringValue?: string;
  timestampValue?: string;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
}

export interface FirestoreTeacherDocument {
  name: string;
  fields?: Record<string, FirestoreValue>;
}

export class TeacherDocumentMapper {
  fromDocument(document: FirestoreTeacherDocument): Teacher {
    const fields = document.fields ?? {};

    return {
      id: document.name.split('/').pop() ?? '',
      firstName: this.string(fields, 'firstName'),
      lastName: this.string(fields, 'lastName'),
      birthDate: this.string(fields, 'birthDate'),
      nationality: this.string(fields, 'nationality'),
      gender: this.string(fields, 'gender'),
      idNumber: this.string(fields, 'idNumber'),
      address: this.string(fields, 'address'),
      phone: this.string(fields, 'phone'),
      assignments: this.assignments(fields['assignments']),
      courses: this.courses(fields['courses']),
      photoUrl: this.string(fields, 'photoUrl'),
      status: this.string(fields, 'status'),
      createdAt: this.date(fields, 'createdAt'),
      updatedAt: this.date(fields, 'updatedAt'),
    };
  }

  private string(fields: Record<string, FirestoreValue>, key: string): string {
    return fields[key]?.stringValue?.trim() ?? '';
  }

  private date(fields: Record<string, FirestoreValue>, key: string): Date | undefined {
    const value = fields[key]?.timestampValue;
    return value ? new Date(value) : undefined;
  }

  private assignments(value: FirestoreValue | undefined): TeacherAssignment[] {
    return (value?.arrayValue?.values ?? []).map((item) => ({
      subject: item.mapValue?.fields?.['subject']?.stringValue?.trim() ?? '',
      detail: item.mapValue?.fields?.['detail']?.stringValue?.trim() ?? '',
    }));
  }

  private courses(value: FirestoreValue | undefined): TeacherCourseAssignment[] {
    return (value?.arrayValue?.values ?? []).map((item) => ({
      course: item.mapValue?.fields?.['course']?.stringValue?.trim() ?? '',
      section: item.mapValue?.fields?.['section']?.stringValue?.trim() ?? '',
    }));
  }
}
