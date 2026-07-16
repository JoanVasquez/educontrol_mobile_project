import type { Breakdown } from '../models/breakdown.model';
import { FirestoreBreakdownMapper } from './firestore-breakdown.mapper';

describe('FirestoreBreakdownMapper', () => {
  const mapper = new FirestoreBreakdownMapper();

  it('maps Firestore documents to breakdowns with fallbacks', () => {
    expect(mapper.fromDocument({
      name: 'projects/demo/databases/(default)/documents/breakdowns/b1',
      fields: {
        category: { stringValue: 'Plomería' },
        description: { stringValue: 'Fuga' },
        priority: { stringValue: 'high' },
        location: { stringValue: 'Baño' },
        status: { stringValue: 'in-progress' },
        createdAt: { timestampValue: '2026-07-15T10:00:00.000Z' },
      },
    })).toEqual(jasmine.objectContaining({
      id: 'b1',
      category: 'Plomería',
      description: 'Fuga',
      priority: 'high',
      location: 'Baño',
      status: 'in-progress',
      photoUrl: null,
      createdAt: '2026-07-15T10:00:00.000Z',
    }));

    expect(mapper.fromDocument({ name: 'breakdowns/missing' })).toEqual(jasmine.objectContaining({
      id: 'missing',
      category: 'Otra',
      priority: 'low',
      status: 'pending',
    }));
  });

  it('maps breakdowns to Firestore payloads with null sentinels', () => {
    const breakdown: Breakdown = {
      category: 'Tecnología',
      description: 'Proyector',
      priority: 'medium',
      location: 'Laboratorio',
      photoUrl: null,
      photoDataUrl: 'data:image/jpeg;base64,abc',
      photoName: 'foto.jpg',
      photoContentType: 'image/jpeg',
      status: 'resolved',
      notes: '',
      createdAt: '2026-07-15T10:00:00.000Z',
    };

    expect(mapper.toPayload(breakdown)).toEqual({
      fields: {
        category: { stringValue: 'Tecnología' },
        description: { stringValue: 'Proyector' },
        priority: { stringValue: 'medium' },
        location: { stringValue: 'Laboratorio' },
        photoUrl: { nullValue: 'NULL_VALUE' },
        photoDataUrl: { stringValue: 'data:image/jpeg;base64,abc' },
        photoName: { stringValue: 'foto.jpg' },
        photoContentType: { stringValue: 'image/jpeg' },
        status: { stringValue: 'resolved' },
        notes: { nullValue: 'NULL_VALUE' },
        createdAt: { timestampValue: '2026-07-15T10:00:00.000Z' },
        updatedAt: { timestampValue: '2026-07-15T10:00:00.000Z' },
      },
    });
  });
});
