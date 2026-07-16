import { LocalDeviceRepository } from './local-device.repository';

describe('LocalDeviceRepository', () => {
  beforeEach(() => localStorage.clear());

  it('returns an existing device id', () => {
    localStorage.setItem('educontrol.local-sync.device-id', 'device-existing');

    expect(new LocalDeviceRepository().getDeviceId()).toBe('device-existing');
  });

  it('creates and reuses a generated device id', () => {
    const repository = new LocalDeviceRepository();
    const deviceId = repository.getDeviceId();

    expect(deviceId.length).toBeGreaterThan(0);
    expect(repository.getDeviceId()).toBe(deviceId);
    expect(localStorage.getItem('educontrol.local-sync.device-id')).toBe(deviceId);
  });
});
