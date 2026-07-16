import { Injectable, inject } from '@angular/core';
import { APP_STORAGE_KEYS } from '../storage/app-storage.keys';
import { IonicKeyValueStorage } from '../storage/ionic-key-value.storage';

@Injectable({ providedIn: 'root' })
export class LocalDeviceRepository {
  private readonly storage = inject(IonicKeyValueStorage);

  getDeviceId(): string {
    const storedDeviceId = this.storage.getString(APP_STORAGE_KEYS.localSyncDeviceId);
    if (storedDeviceId) return storedDeviceId;

    const deviceId = this.createDeviceId();
    this.storage.setString(APP_STORAGE_KEYS.localSyncDeviceId, deviceId);
    return deviceId;
  }

  private createDeviceId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `device-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
