import type { BreakdownUpdateForm } from './breakdown-update.model';
import { BreakdownUpdateValidator } from './breakdown-update.validator';

describe('BreakdownUpdateValidator', () => {
  const validator = new BreakdownUpdateValidator();
  const validForm: BreakdownUpdateForm = {
    category: 'Electricidad',
    description: 'Cable expuesto',
    location: 'Aula 2',
    priority: 'high',
    status: 'pending',
    notes: '',
  };

  it('accepts a complete update form', () => {
    expect(validator.validate(validForm)).toEqual({ isValid: true, message: '' });
  });

  it('rejects missing category, location and description in priority order', () => {
    expect(validator.validate({ ...validForm, category: '' as BreakdownUpdateForm['category'] }).message)
      .toBe('Selecciona una categoría.');
    expect(validator.validate({ ...validForm, location: '   ' }).message).toBe('Indica la ubicación de la avería.');
    expect(validator.validate({ ...validForm, description: '   ' }).message).toBe('Describe la avería.');
  });
});
