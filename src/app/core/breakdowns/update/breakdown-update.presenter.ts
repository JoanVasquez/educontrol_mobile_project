import type { Breakdown, BreakdownStatus } from '../../models/breakdown.model';
import type { BreakdownUpdateForm, BreakdownUpdateViewModel } from './breakdown-update.model';
import { BREAKDOWN_STATUS_OPTIONS } from './breakdown-update.options';

export class BreakdownUpdatePresenter {
  present(breakdown: Breakdown): BreakdownUpdateViewModel {
    return {
      form: {
        category: breakdown.category,
        priority: breakdown.priority,
        location: breakdown.location,
        description: breakdown.description,
        status: breakdown.status,
        notes: breakdown.notes || '',
      },
      summary: {
        code: this.code(breakdown.id),
        title: this.title(breakdown),
        location: breakdown.location || 'Sin ubicación',
        reportedAt: this.reportedAt(breakdown.createdAt),
        statusLabel: this.statusLabel(breakdown.status),
      },
    };
  }

  toUpdate(form: BreakdownUpdateForm): Partial<Breakdown> {
    return {
      category: form.category,
      priority: form.priority,
      location: form.location.trim(),
      description: form.description.trim(),
      status: form.status,
      notes: form.notes.trim() || null,
    };
  }

  statusLabel(status: BreakdownStatus): string {
    return BREAKDOWN_STATUS_OPTIONS.find((option) => option.value === status)?.label || status;
  }

  private code(id: string | undefined): string {
    if (!id) {
      return 'AV-SIN-ID';
    }

    return 'AV-' + id.slice(0, 6).toUpperCase();
  }

  private title(breakdown: Breakdown): string {
    const description = breakdown.description.trim();
    return description || breakdown.category;
  }

  private reportedAt(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat('es-DO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }
}
