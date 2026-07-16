import type { Breakdown } from '../models/breakdown.model';
import { formatBreakdownForDisplay, mapFormToBreakdown } from './mappers.util';

describe('mappers util', () => {
  it('maps form data to a pending breakdown and trims text', () => {
    const breakdown = mapFormToBreakdown({
      category: 'Electricidad',
      description: '  Cable suelto  ',
      priority: 'high',
      location: '  Aula 1  ',
    });

    expect(breakdown).toEqual(jasmine.objectContaining({
      category: 'Electricidad',
      description: 'Cable suelto',
      location: 'Aula 1',
      priority: 'high',
      status: 'pending',
      photoUrl: null,
    }));
    expect(new Date(breakdown.createdAt).getTime()).not.toBeNaN();
  });

  it('formats breakdown labels for display and falls back to raw values', () => {
    const breakdown: Breakdown = {
      category: 'Otra',
      description: 'Puerta',
      priority: 'medium',
      location: 'Entrada',
      photoUrl: null,
      photoDataUrl: null,
      photoName: null,
      photoContentType: null,
      status: 'resolved',
      notes: null,
      createdAt: '2026-07-15T00:00:00.000Z',
    };

    expect(formatBreakdownForDisplay(breakdown)).toEqual({
      categoryLabel: 'Otra',
      priorityLabel: 'Media',
      statusLabel: 'Resuelto',
      formattedDate: new Date(breakdown.createdAt).toLocaleDateString('es-ES'),
    });
  });

  it('keeps raw labels for unexpected priority or status values', () => {
    const breakdown: Breakdown = {
      category: 'Otra',
      description: 'Puerta',
      priority: 'urgent' as Breakdown['priority'],
      location: 'Entrada',
      photoUrl: null,
      photoDataUrl: null,
      photoName: null,
      photoContentType: null,
      status: 'blocked' as Breakdown['status'],
      notes: null,
      createdAt: '2026-07-15T00:00:00.000Z',
    };

    expect(formatBreakdownForDisplay(breakdown)).toEqual(jasmine.objectContaining({
      priorityLabel: 'urgent',
      statusLabel: 'blocked',
    }));
  });
});
