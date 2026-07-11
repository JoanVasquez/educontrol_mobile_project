import type { BreakdownCategory, BreakdownStatus, Priority } from '../../models/breakdown.model';

export const BREAKDOWN_CATEGORY_OPTIONS: BreakdownCategory[] = [
  'Electricidad',
  'Plomería',
  'Mobiliario',
  'Climatización',
  'Tecnología',
  'Otra',
];

export const BREAKDOWN_PRIORITY_OPTIONS: Array<{ value: Priority; label: string }> = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
];

export const BREAKDOWN_STATUS_OPTIONS: Array<{ value: BreakdownStatus; label: string }> = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in-progress', label: 'En proceso' },
  { value: 'resolved', label: 'Resuelta' },
];
