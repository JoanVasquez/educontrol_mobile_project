import { Injectable } from '@angular/core';
import { normalizeCourseAssignments } from '../../core/academic/academic-course.catalog';
import type {
  SerializedTeacherPhoto,
  TeacherAssignment,
  TeacherCourseAssignment,
  TeacherRegistrationCommand,
  TeacherRegistrationDraft,
} from '../../core/teachers/teacher-registration.model';

export interface TeacherRegistrationFormValue {
  firstName: string;
  lastName: string;
  email: string;
  accessCode: string;
  institution: string;
  district: string;
  birthDate: string;
  nationality: string;
  gender: string;
  idNumber: string;
  address: string;
  phone: string;
}

@Injectable({ providedIn: 'root' })
export class TeacherRegistrationCommandFactory {
  create(
    value: TeacherRegistrationFormValue,
    assignments: TeacherAssignment[],
    courseAssignments: TeacherCourseAssignment[],
    photo: SerializedTeacherPhoto | null,
  ): TeacherRegistrationCommand {
    const now = new Date().toISOString();
    const teacher: TeacherRegistrationDraft = {
      email: value.email.trim().toLowerCase(),
      authUid: '',
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      birthDate: value.birthDate,
      nationality: value.nationality,
      gender: value.gender,
      idNumber: value.idNumber.trim(),
      address: value.address.trim(),
      phone: value.phone.trim(),
      assignments: assignments.filter((item) => item.subject),
      courses: normalizeCourseAssignments(courseAssignments),
      photoUrl: '',
      photoPath: '',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    return {
      registrationId: crypto.randomUUID(),
      teacher,
      userProfile: {
        codigo: value.accessCode.trim(),
        institucion: value.institution.trim(),
        distrito: value.district.trim(),
      },
      photo,
    };
  }
}
