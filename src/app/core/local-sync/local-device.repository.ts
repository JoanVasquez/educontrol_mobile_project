import { Injectable } from '@angular/core';

const LOCAL_DEVICE_ID_KEY = 'educontrol.local-sync.device-id';

@Injectable({ providedIn: 'root' })
export class LocalDeviceRepository {
  getDeviceId(): string {
    const storedDeviceId = localStorage.getItem(LOCAL_DEVICE_ID_KEY);
    if (storedDeviceId) return storedDeviceId;

    const deviceId = this.createDeviceId();
    localStorage.setItem(LOCAL_DEVICE_ID_KEY, deviceId);
    return deviceId;
  }

  private createDeviceId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `device-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
