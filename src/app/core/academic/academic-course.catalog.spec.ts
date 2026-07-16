import {
  getAcademicSubjectsByCourse,
  isAcademicCourse,
  normalizeAcademicCourse,
  normalizeAcademicSubjects,
  normalizeCourseAssignments,
} from './academic-course.catalog';

describe('academic course catalog', () => {
  it('normalizes legacy course labels', () => {
    expect(normalizeAcademicCourse('3ro')).toBe('Tercero');
    expect(normalizeAcademicCourse(' Sexto ')).toBe('Sexto');
  });

  it('checks supported academic courses after normalization', () => {
    expect(isAcademicCourse('1ro')).toBeTrue();
    expect(isAcademicCourse('Septimo')).toBeFalse();
  });

  it('returns Dominican primary subjects by course', () => {
    expect(getAcademicSubjectsByCourse('Primero')).toEqual([
      'Lengua Espanola',
      'Matematica',
      'Ciencias Sociales',
      'Ciencias de la Naturaleza',
      'Ingles',
      'Educacion Artistica',
      'Educacion Fisica',
      'Formacion Integral Humana y Religiosa',
    ]);
  });

  it('returns an empty list for unsupported courses', () => {
    expect(getAcademicSubjectsByCourse('Septimo')).toEqual([]);
  });

  it('normalizes and deduplicates subject labels', () => {
    expect(normalizeAcademicSubjects([' Matemáticas ', 'matematica', 'Ciencias Naturales'])).toEqual([
      'Matematica',
      'Ciencias de la Naturaleza',
    ]);
  });

  it('normalizes and deduplicates course assignments', () => {
    expect(normalizeCourseAssignments([
      { course: '3ro', section: ' A ' },
      { course: 'Tercero', section: 'a' },
      { course: '', section: 'B' },
    ])).toEqual([{ course: 'Tercero', section: 'A' }]);
  });
});
