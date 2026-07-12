export const ACADEMIC_COURSES = ['Inicial', 'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto'] as const;

export type AcademicCourse = (typeof ACADEMIC_COURSES)[number];

const INITIAL_ACADEMIC_SUBJECTS = [
  'Desarrollo personal y social',
  'Comunicacion',
  'Pensamiento logico, creativo y critico',
  'Exploracion y conocimiento del entorno',
  'Desarrollo fisico y salud',
] as const;

const PRIMARY_ACADEMIC_SUBJECTS = [
  'Lengua Espanola',
  'Matematica',
  'Ciencias Sociales',
  'Ciencias de la Naturaleza',
  'Ingles',
  'Educacion Artistica',
  'Educacion Fisica',
  'Formacion Integral Humana y Religiosa',
] as const;

export type AcademicSubject = (typeof INITIAL_ACADEMIC_SUBJECTS)[number] | (typeof PRIMARY_ACADEMIC_SUBJECTS)[number];

const SUBJECTS_BY_COURSE: Record<AcademicCourse, readonly AcademicSubject[]> = {
  Inicial: INITIAL_ACADEMIC_SUBJECTS,
  Primero: PRIMARY_ACADEMIC_SUBJECTS,
  Segundo: PRIMARY_ACADEMIC_SUBJECTS,
  Tercero: PRIMARY_ACADEMIC_SUBJECTS,
  Cuarto: PRIMARY_ACADEMIC_SUBJECTS,
  Quinto: PRIMARY_ACADEMIC_SUBJECTS,
  Sexto: PRIMARY_ACADEMIC_SUBJECTS,
};

const LEGACY_SUBJECT_LABELS: Record<string, AcademicSubject> = {
  matematicas: 'Matematica',
  matematica: 'Matematica',
  'lengua espanola': 'Lengua Espanola',
  'ciencias naturales': 'Ciencias de la Naturaleza',
  'ciencias de la naturaleza': 'Ciencias de la Naturaleza',
  'ciencias sociales': 'Ciencias Sociales',
  ingles: 'Ingles',
  'educacion artistica': 'Educacion Artistica',
  'educacion fisica': 'Educacion Fisica',
  'formacion integral humana y religiosa': 'Formacion Integral Humana y Religiosa',
};

const LEGACY_COURSE_LABELS: Record<string, AcademicCourse> = {
  '1ro': 'Primero',
  '2do': 'Segundo',
  '3ro': 'Tercero',
  '4to': 'Cuarto',
  '5to': 'Quinto',
  '6to': 'Sexto',
};

export function normalizeAcademicCourse(course: string): string {
  const trimmedCourse = course.trim();
  return LEGACY_COURSE_LABELS[trimmedCourse] ?? trimmedCourse;
}

export function normalizeAcademicText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim();
}

export function normalizeAcademicSubject(subject: string): string {
  const normalizedSubject = normalizeAcademicText(subject);
  return LEGACY_SUBJECT_LABELS[normalizedSubject] ?? subject.trim();
}

export function normalizeAcademicSubjects(subjects: string[]): string[] {
  const seen = new Set<string>();

  return subjects.reduce<string[]>((normalizedSubjects, subject) => {
    const normalizedSubject = normalizeAcademicSubject(subject);
    const key = normalizeAcademicText(normalizedSubject);

    if (!normalizedSubject || seen.has(key)) {
      return normalizedSubjects;
    }

    seen.add(key);
    normalizedSubjects.push(normalizedSubject);

    return normalizedSubjects;
  }, []);
}

export function isAcademicCourse(course: string): course is AcademicCourse {
  return ACADEMIC_COURSES.includes(normalizeAcademicCourse(course) as AcademicCourse);
}

export function getAcademicSubjectsByCourse(course: string): AcademicSubject[] {
  const normalizedCourse = normalizeAcademicCourse(course);

  if (!isAcademicCourse(normalizedCourse)) {
    return [];
  }

  return [...SUBJECTS_BY_COURSE[normalizedCourse]];
}

export interface CourseAssignmentLike {
  course: string;
  section: string;
}

export function normalizeCourseAssignments<TCourseAssignment extends CourseAssignmentLike>(
  assignments: TCourseAssignment[],
): TCourseAssignment[] {
  const seen = new Set<string>();

  return assignments.reduce<TCourseAssignment[]>((normalizedAssignments, assignment) => {
    const normalizedCourse = normalizeAcademicCourse(assignment.course);
    const normalizedSection = assignment.section.trim();

    if (!normalizedCourse) {
      return normalizedAssignments;
    }

    const key = `${normalizedCourse.toLocaleLowerCase('es')}|${normalizedSection.toLocaleLowerCase('es')}`;

    if (seen.has(key)) {
      return normalizedAssignments;
    }

    seen.add(key);
    normalizedAssignments.push({
      ...assignment,
      course: normalizedCourse,
      section: normalizedSection,
    });

    return normalizedAssignments;
  }, []);
}
