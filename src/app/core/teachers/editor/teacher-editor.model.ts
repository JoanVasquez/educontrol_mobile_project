import type { TeacherAssignment, TeacherCourseAssignment } from '../teacher-registration.model';

export interface EditableTeacher {
  id: string;
  email: string;
  authUid: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  gender: string;
  idNumber: string;
  address: string;
  phone: string;
  assignments: TeacherAssignment[];
  courses: TeacherCourseAssignment[];
  photoUrl: string;
  photoPath: string;
  status: 'active';
  createdAt: string;
  updatedAt: string;
}

export interface TeacherEditorResult {
  teacher: EditableTeacher;
  source: 'remote' | 'cache';
}
