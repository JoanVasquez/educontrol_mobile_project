import { Injectable } from '@angular/core';
import { getAcademicSubjectsByCourse, normalizeAcademicCourse } from '../../core/academic/academic-course.catalog';
import type { StudentRegistrationDraft } from '../../modo_offline/student-registration.model';

export interface StudentRegistrationFormValue {
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  gender: string;
  course: string;
  motherName: string;
  motherId: string;
  fatherName: string;
  fatherId: string;
  address: string;
  contactPhone: string;
}

@Injectable({ providedIn: 'root' })
export class StudentRegistrationDraftFactory {
  create(value: StudentRegistrationFormValue): StudentRegistrationDraft {
    const now = new Date().toISOString();
    const course = normalizeAcademicCourse(value.course);

    return {
      nombres: value.firstName.trim(),
      apellidos: value.lastName.trim(),
      fechaNacimiento: value.birthDate,
      nacionalidad: value.nationality,
      genero: value.gender,
      curso: course,
      asignaturas: getAcademicSubjectsByCourse(course),
      nombreMadre: value.motherName.trim(),
      cedulaMadre: value.motherId.trim(),
      nombrePadre: value.fatherName.trim(),
      cedulaPadre: value.fatherId.trim(),
      direccion: value.address.trim(),
      telefonoContacto: value.contactPhone.trim(),
      fotoUrl: '',
      estado: 'activo',
      createdAt: now,
      updatedAt: now,
    };
  }
}
