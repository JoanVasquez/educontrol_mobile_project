import type { BreakdownUpdateForm, BreakdownUpdateValidationResult } from './breakdown-update.model';

export class BreakdownUpdateValidator {
  validate(form: BreakdownUpdateForm): BreakdownUpdateValidationResult {
    if (!form.category) {
      return this.invalid('Selecciona una categoría.');
    }

    if (!form.location.trim()) {
      return this.invalid('Indica la ubicación de la avería.');
    }

    if (!form.description.trim()) {
      return this.invalid('Describe la avería.');
    }

    return { isValid: true, message: '' };
  }

  private invalid(message: string): BreakdownUpdateValidationResult {
    return { isValid: false, message };
  }
}
