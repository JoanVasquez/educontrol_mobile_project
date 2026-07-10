export class LocationErrorMapper {
  static message(error: unknown): string {
    if (error && typeof error === 'object' && 'code' in error) {
      const code = Number((error as { code: unknown }).code);
      if (code === 1) return 'El permiso de ubicación fue rechazado.';
      if (code === 2) return 'El dispositivo no pudo determinar la ubicación.';
      if (code === 3) return 'La búsqueda de ubicación agotó el tiempo de espera.';
    }

    return error instanceof Error ? error.message : 'No se pudo obtener la ubicación.';
  }
}
