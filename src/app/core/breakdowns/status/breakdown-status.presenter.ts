import type { Breakdown, BreakdownCategory, BreakdownStatus, Priority } from '../../models/breakdown.model';
import type { BreakdownStatusListItem, BreakdownStatusResult } from './breakdown-status.model';

const DEFAULT_ASSET = 'assets/breakdowns/paint.svg';

const CATEGORY_ASSETS: Record<BreakdownCategory, string> = {
  Electricidad: 'assets/breakdowns/paint.svg',
  Plomería: 'assets/breakdowns/leak.svg',
  Mobiliario: 'assets/breakdowns/chair.svg',
  Climatización: 'assets/breakdowns/paint.svg',
  Tecnología: 'assets/breakdowns/paint.svg',
  Otra: DEFAULT_ASSET,
};

const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

const STATUS_LABELS: Record<BreakdownStatus, string> = {
  pending: 'Pendiente',
  'in-progress': 'En proceso',
  resolved: 'Resuelta',
};

export class BreakdownStatusPresenter {
  present(breakdowns: Breakdown[]): BreakdownStatusResult {
    return {
      items: breakdowns
        .filter((breakdown): breakdown is Breakdown & { id: string } => Boolean(breakdown.id))
        .sort((first, second) => this.timestamp(second.createdAt) - this.timestamp(first.createdAt))
        .map((breakdown) => this.toListItem(breakdown)),
    };
  }

  priorityLabel(priority: Priority): string {
    return PRIORITY_LABELS[priority];
  }

  statusLabel(status: BreakdownStatus): string {
    return STATUS_LABELS[status];
  }

  private toListItem(breakdown: Breakdown & { id: string }): BreakdownStatusListItem {
    return {
      id: breakdown.id,
      title: this.title(breakdown),
      location: breakdown.location || 'Sin ubicación',
      date: this.date(breakdown.createdAt),
      priority: breakdown.priority,
      status: breakdown.status,
      image: breakdown.photoDataUrl || breakdown.photoUrl || CATEGORY_ASSETS[breakdown.category] || DEFAULT_ASSET,
    };
  }

  private title(breakdown: Breakdown): string {
    const description = breakdown.description.trim();
    return description || breakdown.category;
  }

  private date(value: string): string {
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

  private timestamp(value: string): number {
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }
}
