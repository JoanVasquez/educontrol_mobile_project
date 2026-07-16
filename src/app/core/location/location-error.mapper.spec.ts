import { LocationErrorMapper } from './location-error.mapper';

describe('LocationErrorMapper', () => {
  it('maps geolocation error codes', () => {
    expect(LocationErrorMapper.message({ code: 1 })).toBe('El permiso de ubicación fue rechazado.');
    expect(LocationErrorMapper.message({ code: 2 })).toBe('El dispositivo no pudo determinar la ubicación.');
    expect(LocationErrorMapper.message({ code: 3 })).toBe('La búsqueda de ubicación agotó el tiempo de espera.');
  });

  it('uses Error messages when available', () => {
    expect(LocationErrorMapper.message(new Error('GPS apagado'))).toBe('GPS apagado');
  });

  it('falls back to the generic location message', () => {
    expect(LocationErrorMapper.message('unknown')).toBe('No se pudo obtener la ubicación.');
    expect(LocationErrorMapper.message({ code: 99 })).toBe('No se pudo obtener la ubicación.');
  });
});
