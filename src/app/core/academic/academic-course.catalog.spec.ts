import { getAcademicSubjectsByCourse, isAcademicCourse, normalizeAcademicCourse } from './academic-course.catalog';

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
      'Educacion Artistica',
      'Educacion Fisica',
      'Formacion Integral Humana y Religiosa',
    ]);
  });

  it('returns an empty list for unsupported courses', () => {
    expect(getAcademicSubjectsByCourse('Septimo')).toEqual([]);
  });
});
