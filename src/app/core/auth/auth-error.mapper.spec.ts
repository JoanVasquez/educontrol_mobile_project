import { mapFirebaseAuthError } from './auth-error.mapper';

describe('mapFirebaseAuthError', () => {
  it('maps known Firebase auth error codes to friendly messages', () => {
    expect(mapFirebaseAuthError({ error: { message: 'INVALID_LOGIN_CREDENTIALS' } }))
      .toBe('Credenciales inválidas. Verifica tu correo y contraseña.');
    expect(mapFirebaseAuthError({ error: { message: 'USER_DISABLED' } }))
      .toBe('La cuenta está deshabilitada. Contacta al administrador.');
  });

  it('returns the original Error message when no Firebase code is available', () => {
    expect(mapFirebaseAuthError(new Error('Sin conexión'))).toBe('Sin conexión');
  });

  it('uses the generic message for unknown codes and non-errors', () => {
    expect(mapFirebaseAuthError({ error: { message: 'SOMETHING_ELSE' } }))
      .toBe('No fue posible iniciar sesión. Intenta nuevamente.');
    expect(mapFirebaseAuthError(null)).toBe('No fue posible iniciar sesión. Intenta nuevamente.');
  });

  it('maps too many attempts to the throttling message', () => {
    expect(mapFirebaseAuthError({ error: { message: 'TOO_MANY_ATTEMPTS_TRY_LATER' } }))
      .toBe('Demasiados intentos fallidos. Intenta nuevamente más tarde.');
  });
});
