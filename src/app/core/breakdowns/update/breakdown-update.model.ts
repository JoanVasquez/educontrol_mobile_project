import type { BreakdownCategory, BreakdownStatus, Priority } from '../../models/breakdown.model';

export interface BreakdownUpdateForm {
  category: BreakdownCategory;
  priority: Priority;
  location: string;
  description: string;
  status: BreakdownStatus;
  notes: string;
}

export interface BreakdownUpdateSummary {
  code: string;
  title: string;
  location: string;
  reportedAt: string;
  statusLabel: string;
}

export interface BreakdownUpdateViewModel {
  form: BreakdownUpdateForm;
  summary: BreakdownUpdateSummary;
}

export interface BreakdownUpdateValidationResult {
  isValid: boolean;
  message: string;
}
