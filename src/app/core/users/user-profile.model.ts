export type UserRole = 'admin' | 'director' | 'docente' | 'secretaria';
export type UserStatus = 'active' | 'inactive';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export const ADMIN_ROLE: UserRole = 'admin';
