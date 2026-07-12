import { Injectable } from '@angular/core';
import type { RegisterTeacherResult } from '../../core/teachers/teacher-registration.model';

@Injectable({ providedIn: 'root' })
export class TeacherRegistrationMessagePresenter {
  resultMessage(result: RegisterTeacherResult): string {
    if (result.reason === 'permission-denied') {
      return 'No se pudo registrar el docente. Verifica los permisos del usuario.';
    }

    if (result.reason === 'auth-user-exists') {
      return 'No se pudo registrar el docente: ya existe una cuenta con ese correo.';
    }

    return result.mode === 'rejected'
      ? 'No se pudo registrar el docente. Intenta nuevamente.'
      : 'Docente registrado correctamente.';
  }
}
