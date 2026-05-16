const FIREBASE_AUTH_ERRORS: Record<string, string> = {
  EMAIL_NOT_FOUND: 'No existe una cuenta con ese correo institucional.',
  INVALID_LOGIN_CREDENTIALS: 'Credenciales inválidas. Verifica tu correo y contraseña.',
  INVALID_PASSWORD: 'Credenciales inválidas. Verifica tu correo y contraseña.',
  USER_DISABLED: 'La cuenta está deshabilitada. Contacta al administrador.',
  TOO_MANY_ATTEMPTS_TRY_LATER: 'Demasiados intentos fallidos. Intenta nuevamente más tarde.',
};

export function mapFirebaseAuthError(error: unknown): string {
  const code = extractFirebaseErrorCode(error);

  if (!code) {
    return error instanceof Error ? error.message : 'No fue posible iniciar sesión. Intenta nuevamente.';
  }

  return FIREBASE_AUTH_ERRORS[code] ?? 'No fue posible iniciar sesión. Intenta nuevamente.';
}

function extractFirebaseErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const maybeError = error as { error?: { message?: string } };
  return maybeError.error?.message;
}
