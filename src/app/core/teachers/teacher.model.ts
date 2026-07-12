import type { TeacherAssignment, TeacherCourseAssignment } from './teacher-registration.model';

export interface Teacher {
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
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TeacherListItem {
  id: string;
  fullName: string;
  subjectLabel: string;
  courseLabel: string;
  photoUrl: string;
}

export interface TeacherListResult {
  teachers: TeacherListItem[];
  source: 'remote' | 'cache';
}
