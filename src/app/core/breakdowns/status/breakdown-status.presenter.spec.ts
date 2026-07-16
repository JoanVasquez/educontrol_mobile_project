import type { Breakdown } from '../../models/breakdown.model';
import { BreakdownStatusPresenter } from './breakdown-status.presenter';

describe('BreakdownStatusPresenter', () => {
  const presenter = new BreakdownStatusPresenter();

  function breakdown(overrides: Partial<Breakdown>): Breakdown {
    return {
      id: 'b1',
      category: 'Electricidad',
      description: 'Foco dañado',
      priority: 'medium',
      location: 'Pasillo',
      photoUrl: null,
      photoDataUrl: null,
      photoName: null,
      photoContentType: null,
      videoDataUrl: null,
      videoName: null,
      videoContentType: null,
      status: 'pending',
      notes: null,
      createdAt: '2026-07-10T10:00:00.000Z',
      ...overrides,
    };
  }

  it('filters items without id and orders newest first', () => {
    const result = presenter.present([
      breakdown({ id: 'old', createdAt: '2026-07-01T10:00:00.000Z' }),
      breakdown({ id: undefined }),
      breakdown({ id: 'new', createdAt: '2026-07-12T10:00:00.000Z' }),
    ]);

    expect(result.items.map((item) => item.id)).toEqual(['new', 'old']);
  });

  it('falls back to category, location and invalid date labels', () => {
    const [item] = presenter.present([
      breakdown({
        description: '   ',
        location: '',
        createdAt: 'bad-date',
        category: 'Mobiliario',
      }),
    ]).items;

    expect(item.title).toBe('Mobiliario');
    expect(item.location).toBe('Sin ubicación');
    expect(item.date).toBe('Fecha no disponible');
    expect(item.image).toBe('assets/breakdowns/chair.svg');
  });

  it('exposes user-facing labels for priority and status', () => {
    expect(presenter.priorityLabel('high')).toBe('Alta');
    expect(presenter.statusLabel('in-progress')).toBe('En proceso');
  });

  it('prefers embedded photo evidence over urls and category images', () => {
    const [item] = presenter.present([
      breakdown({ photoDataUrl: 'data:image/jpeg;base64,abc', photoUrl: 'https://example.com/photo.jpg' }),
    ]).items;

    expect(item.image).toBe('data:image/jpeg;base64,abc');
  });

  it('uses photo urls when no embedded photo is available', () => {
    const [item] = presenter.present([
      breakdown({ photoUrl: 'https://example.com/photo.jpg' }),
    ]).items;

    expect(item.image).toBe('https://example.com/photo.jpg');
  });
});
