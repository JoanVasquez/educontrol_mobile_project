export interface StudentAcademicRecord {
  id: string;
  fullName: string;
  course: string;
  subjects: string[];
  status: string;
  updatedAt: string;
}

export interface StudentCourseUpdate {
  course: string;
  subjects: string[];
  updatedAt: string;
}

export interface PendingStudentCourseUpdate {
  localId: string;
  studentId: string;
  update: StudentCourseUpdate;
  createdAt: string;
  updatedAt: string;
}
