import { normalizeCourseAssignments } from '../../core/academic/academic-course.catalog';
import type { EditableTeacher } from '../../core/teachers/editor/teacher-editor.model';

export function createEditableTeacher(teacher: EditableTeacher): EditableTeacher {
  return {
    ...teacher,
    assignments: teacher.assignments.length ? teacher.assignments.map((item) => ({ ...item })) : [{ subject: '', detail: '' }],
    courses: teacher.courses.length ? normalizeCourseAssignments(teacher.courses).map((item) => ({ ...item })) : [{ course: '', section: '' }],
  };
}

export function isTeacherEditorValid(teacher: EditableTeacher): boolean {
  return Boolean(
    teacher.firstName.trim() &&
      teacher.lastName.trim() &&
      teacher.birthDate &&
      teacher.nationality &&
      teacher.gender &&
      teacher.idNumber.trim() &&
      teacher.address.trim() &&
      teacher.phone.trim(),
  );
}

export function normalizeEditableTeacher(teacher: EditableTeacher): EditableTeacher {
  return {
    ...teacher,
    firstName: teacher.firstName.trim(),
    lastName: teacher.lastName.trim(),
    idNumber: teacher.idNumber.trim(),
    address: teacher.address.trim(),
    phone: teacher.phone.trim(),
    assignments: teacher.assignments.map((item) => ({
      subject: item.subject.trim(),
      detail: item.detail.trim(),
    })),
    courses: normalizeCourseAssignments(teacher.courses),
  };
}
