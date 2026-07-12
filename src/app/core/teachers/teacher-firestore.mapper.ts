import type { TeacherRegistrationDraft } from './teacher-registration.model';

type FirestoreValue =
  | { stringValue: string }
  | { timestampValue: string }
  | { arrayValue: { values: FirestoreValue[] } }
  | { mapValue: { fields: Record<string, FirestoreValue> } };

export interface FirestoreCreateTeacherPayload {
  fields: Record<keyof TeacherRegistrationDraft, FirestoreValue>;
}

export class TeacherFirestoreMapper {
  toCreatePayload(teacher: TeacherRegistrationDraft): FirestoreCreateTeacherPayload {
    return {
      fields: {
        email: { stringValue: teacher.email },
        authUid: { stringValue: teacher.authUid },
        firstName: { stringValue: teacher.firstName },
        lastName: { stringValue: teacher.lastName },
        birthDate: { stringValue: teacher.birthDate },
        nationality: { stringValue: teacher.nationality },
        gender: { stringValue: teacher.gender },
        idNumber: { stringValue: teacher.idNumber },
        address: { stringValue: teacher.address },
        phone: { stringValue: teacher.phone },
        assignments: {
          arrayValue: {
            values: teacher.assignments.map((assignment) => ({
              mapValue: {
                fields: {
                  subject: { stringValue: assignment.subject },
                  detail: { stringValue: assignment.detail },
                },
              },
            })),
          },
        },
        courses: {
          arrayValue: {
            values: teacher.courses.map((course) => ({
              mapValue: {
                fields: {
                  course: { stringValue: course.course },
                  section: { stringValue: course.section },
                },
              },
            })),
          },
        },
        photoUrl: { stringValue: teacher.photoUrl },
        photoPath: { stringValue: teacher.photoPath },
        status: { stringValue: teacher.status },
        createdAt: { timestampValue: teacher.createdAt },
        updatedAt: { timestampValue: teacher.updatedAt },
      },
    };
  }
}
