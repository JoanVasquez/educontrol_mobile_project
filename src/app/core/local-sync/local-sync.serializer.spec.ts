import type { SyncableEnvelope } from './local-sync.model';
import { LocalSyncSerializer } from './local-sync.serializer';

describe('LocalSyncSerializer', () => {
  it('wraps syncable envelopes with schema metadata', () => {
    const envelopes: SyncableEnvelope[] = [{
      id: 'att-1',
      type: 'attendance-sheet',
      version: 1,
      deviceId: 'device-1',
      createdAt: '2026-07-15T10:00:00.000Z',
      payload: {
        id: 'sheet-1',
        date: '2026-07-15',
        subject: 'Matemática',
        course: '1ro A',
        records: [],
        createdBy: 'admin',
        createdAt: '2026-07-15T09:00:00.000Z',
        updatedAt: '2026-07-15T10:00:00.000Z',
      },
    }];

    expect(JSON.parse(new LocalSyncSerializer().serialize(envelopes))).toEqual({
      schema: 'educontrol.local-sync',
      version: 1,
      envelopes,
    });
  });
});
