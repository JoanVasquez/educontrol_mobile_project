import type { TeacherRegistrationFormValue } from '../services/teacher-registration-command.factory';

export class TeacherRegistrationFormValidator {
  static requiredMessage(value: TeacherRegistrationFormValue): string | null {
    const requiredValues = [
      value.firstName,
      value.lastName,
      value.email,
      value.accessCode,
      value.institution,
      value.district,
      value.birthDate,
      value.nationality,
      value.gender,
      value.idNumber,
      value.address,
      value.phone,
    ];

    return requiredValues.every((item) => item.trim()) ? null : 'Completa todos los campos obligatorios.';
  }

  static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }
}
