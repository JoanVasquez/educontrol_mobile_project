export const ATTENDANCE_MESSAGES = {
  saveSuccess: 'Asistencia guardada correctamente.',
  saveError: 'No se pudo guardar la asistencia.',
} as const;

export const BREAKDOWN_MESSAGES = {
  requiredFields: 'Completa la categoría, descripción y ubicación.',
  saveSuccess: 'Cambios guardados correctamente.',
  saveError: 'No se pudieron guardar los cambios.',
  missingId: 'No se encontró el identificador de la avería.',
  loadError: 'No se pudo consultar la avería.',
  registerSuccess: 'Averia registrada correctamente.',
  registerError: 'No se pudo registrar la averia',
} as const;

export const STUDENT_MESSAGES = {
  registerSuccess: 'Estudiante registrado correctamente.',
  registerError: 'No se pudo registrar el estudiante. Intenta nuevamente.',
  loadError: 'No se pudo cargar el listado de estudiantes.',
  courseChanged: 'Curso y asignaturas actualizados.',
  courseChangeError: 'No se pudo actualizar el curso.',
} as const;

export const TEACHER_MESSAGES = {
  listLoadError: 'No se pudo cargar el listado de docentes.',
} as const;
