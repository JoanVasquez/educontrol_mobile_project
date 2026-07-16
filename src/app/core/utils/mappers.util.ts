import type { Breakdown } from '../models/breakdown.model';

export interface BreakdownFormData {
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  location: string;
}

export function mapFormToBreakdown(formData: BreakdownFormData): Breakdown {
  return {
    category: formData.category as Breakdown['category'],
    description: formData.description.trim(),
    priority: formData.priority,
    location: formData.location.trim(),
    photoUrl: null,
    photoDataUrl: null,
    photoName: null,
    photoContentType: null,
    videoDataUrl: null,
    videoName: null,
    videoContentType: null,
    status: 'pending',
    notes: null,
    createdAt: new Date().toISOString(),
  };
}

export function formatBreakdownForDisplay(breakdown: Breakdown): {
  categoryLabel: string;
  priorityLabel: string;
  statusLabel: string;
  formattedDate: string;
} {
  const priorityLabels: Record<string, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    'in-progress': 'En Progreso',
    resolved: 'Resuelto',
  };

  return {
    categoryLabel: breakdown.category,
    priorityLabel: priorityLabels[breakdown.priority] || breakdown.priority,
    statusLabel: statusLabels[breakdown.status] || breakdown.status,
    formattedDate: new Date(breakdown.createdAt).toLocaleDateString('es-ES'),
  };
}
