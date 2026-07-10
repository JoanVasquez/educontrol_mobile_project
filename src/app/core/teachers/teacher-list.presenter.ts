import type { Teacher, TeacherListItem } from './teacher.model';

const EMPTY_VALUE = 'Sin asignar';

export class TeacherListPresenter {
  toListItem(teacher: Teacher): TeacherListItem {
    return {
      id: teacher.id,
      fullName: `${teacher.firstName} ${teacher.lastName}`.trim(),
      subjectLabel: this.joinUnique(teacher.assignments.map((assignment) => assignment.subject)),
      courseLabel: this.joinUnique(
        teacher.courses.map(({ course, section }) => `${course}${section ? ` ${section}` : ''}`.trim()),
      ),
      photoUrl: teacher.photoUrl,
    };
  }

  private joinUnique(values: string[]): string {
    const normalizedValues = [...new Set(values.map((value) => value.trim()).filter(Boolean))];
    return normalizedValues.length ? normalizedValues.join(', ') : EMPTY_VALUE;
  }
}
