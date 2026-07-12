export interface TeacherAssignment {
  subject: string;
  detail: string;
}

export interface TeacherCourseAssignment {
  course: string;
  section: string;
}

export interface TeacherRegistrationDraft {
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

export interface SerializedTeacherPhoto {
  name: string;
  contentType: string;
  dataUrl: string;
}

export interface TeacherRegistrationCommand {
  registrationId: string;
  teacher: TeacherRegistrationDraft;
  photo: SerializedTeacherPhoto | null;
}

export interface PendingTeacherRegistration {
  localId: string;
  command: TeacherRegistrationCommand;
  createdAt: string;
}

export interface RegisterTeacherResult {
  mode: 'online' | 'offline' | 'queued' | 'rejected';
  reason?: 'auth-missing' | 'auth-user-exists' | 'remote-error' | 'permission-denied';
  pendingCount: number;
  synced: boolean;
}
