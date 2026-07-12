import { AttendanceDateUtil } from './attendance-date.util';

describe('AttendanceDateUtil', () => {
  it('creates a stable Firestore document id', () => {
    expect(AttendanceDateUtil.documentId('Tercero A', '2026-06-24')).toBe('2026-06-24_tercero-a');
  });

  it('removes accents and unsafe separators', () => {
    expect(AttendanceDateUtil.documentId('Educación  3ro / A', '2026-06-24')).toBe(
      '2026-06-24_educacion-3ro-a',
    );
  });

  it('includes subject when provided', () => {
    expect(AttendanceDateUtil.documentId('Tercero', '2026-06-24', 'Lengua Española')).toBe(
      '2026-06-24_tercero_lengua-espanola',
    );
  });
});
