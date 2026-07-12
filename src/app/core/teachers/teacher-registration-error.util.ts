import type { RegisterTeacherResult } from './teacher-registration.model';

type RejectionReason = Extract<RegisterTeacherResult['reason'], 'permission-denied' | 'auth-user-exists'>;

export function teacherRegistrationRejectionReason(error: unknown): RejectionReason | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  if (isPermissionDenied(error)) {
    return 'permission-denied';
  }

  if (isEmailAlreadyInUse(error)) {
    return 'auth-user-exists';
  }

  return null;
}

function isPermissionDenied(error: object): boolean {
  const httpError = error as { status?: unknown; error?: { error?: { status?: unknown } } };
  return httpError.status === 403 || httpError.error?.error?.status === 'PERMISSION_DENIED';
}

function isEmailAlreadyInUse(error: object): boolean {
  const httpError = error as { error?: { error?: { message?: unknown } } };
  return httpError.error?.error?.message === 'EMAIL_EXISTS';
}
