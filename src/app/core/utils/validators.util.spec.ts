import { isValidFileSize, isValidImageFile, isValidText, validateBreakdownForm } from './validators.util';

describe('validators util', () => {
  it('validates non-empty text', () => {
    expect(isValidText(' Aula ')).toBeTrue();
    expect(isValidText('   ')).toBeFalse();
    expect(isValidText(null)).toBeFalse();
  });

  it('collects breakdown form errors', () => {
    expect(validateBreakdownForm('', ' ', undefined)).toEqual({
      isValid: false,
      errors: {
        category: 'La categoría es requerida',
        description: 'La descripción es requerida',
        location: 'La ubicación es requerida',
      },
    });
    expect(validateBreakdownForm('Electricidad', 'Cable suelto', 'Aula 1').isValid).toBeTrue();
  });

  it('validates image mime type and max file size', () => {
    const image = new File(['x'], 'photo.png', { type: 'image/png' });
    const pdf = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    const large = new File([new Uint8Array(2 * 1024 * 1024)], 'photo.jpg', { type: 'image/jpeg' });

    expect(isValidImageFile(image)).toBeTrue();
    expect(isValidImageFile(pdf)).toBeFalse();
    expect(isValidImageFile(undefined)).toBeFalse();
    expect(isValidFileSize(image, 1)).toBeTrue();
    expect(isValidFileSize(large, 1)).toBeFalse();
    expect(isValidFileSize(undefined)).toBeFalse();
  });

  it('accepts supported image variants', () => {
    expect(isValidImageFile(new File(['x'], 'photo.webp', { type: 'image/webp' }))).toBeTrue();
    expect(isValidImageFile(new File(['x'], 'photo.gif', { type: 'image/gif' }))).toBeTrue();
  });

  it('uses the default five megabyte file limit', () => {
    const fiveMb = new File([new Uint8Array(5 * 1024 * 1024)], 'photo.jpg', { type: 'image/jpeg' });
    const tooLarge = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'photo.jpg', { type: 'image/jpeg' });

    expect(isValidFileSize(fiveMb)).toBeTrue();
    expect(isValidFileSize(tooLarge)).toBeFalse();
  });
});
