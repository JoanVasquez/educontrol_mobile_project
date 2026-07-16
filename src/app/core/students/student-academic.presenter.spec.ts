import { StudentAcademicPresenter } from './student-academic.presenter';
import type { PendingStudentCourseUpdate, StudentAcademicRecord } from './student-academic.model';

describe('StudentAcademicPresenter', () => {
  const presenter = new StudentAcademicPresenter();
  const students: StudentAcademicRecord[] = [
    { id: 's1', fullName: 'Ana', course: '1ro', subjects: [], status: 'activo', updatedAt: 'old' },
    { id: 's2', fullName: 'Luis', course: '2do B', subjects: ['Arte'], status: 'activo', updatedAt: 'old' },
  ];

  it('normalizes courses and fills default subjects when empty', () => {
    const result = presenter.normalize(students);

    expect(result[0].course).toBe('Primero');
    expect(result[0].subjects.length).toBeGreaterThan(0);
    expect(result[1].subjects).toEqual(['Arte']);
  });

  it('overlays pending course updates by student id', () => {
    const pending: PendingStudentCourseUpdate[] = [{
      localId: 'local-1',
      studentId: 's2',
      createdAt: 'now',
      updatedAt: 'now',
      update: {
        course: '3ro C',
        subjects: ['Naturales'],
        updatedAt: 'pending-date',
      },
    }];

    expect(presenter.mergePendingUpdates(students, pending)).toEqual([
      students[0],
      { ...students[1], course: '3ro C', subjects: ['Naturales'], updatedAt: 'pending-date' },
    ]);
  });
});
