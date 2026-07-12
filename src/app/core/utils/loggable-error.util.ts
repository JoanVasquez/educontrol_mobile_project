export function toLoggableError(error: unknown): string {
  if (error && typeof error === 'object') {
    const maybeHttpError = error as { status?: unknown; statusText?: unknown; message?: unknown; error?: unknown };

    return JSON.stringify({
      status: maybeHttpError.status,
      statusText: maybeHttpError.statusText,
      message: maybeHttpError.message,
      error: maybeHttpError.error,
    });
  }

  return String(error);
}
