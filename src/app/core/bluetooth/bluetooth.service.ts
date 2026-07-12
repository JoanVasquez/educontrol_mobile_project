import { Injectable } from '@angular/core';
import type { BluetoothDeviceSummary, BluetoothSendResult } from './bluetooth.model';
import BluetoothLocalSync from './bluetooth.plugin';

@Injectable({ providedIn: 'root' })
export class BluetoothService {
  async requestPermissions(): Promise<void> {
    await BluetoothLocalSync.requestPermissions();
  }

  async isAvailable(): Promise<boolean> {
    const result = await BluetoothLocalSync.isAvailable();
    return result.available;
  }

  async discoverDevices(): Promise<BluetoothDeviceSummary[]> {
    await this.requestPermissions();
    const result = await BluetoothLocalSync.discoverDevices();
    return result.devices;
  }

  async connect(deviceId: string): Promise<BluetoothSendResult> {
    return BluetoothLocalSync.connect({ deviceId });
  }

  async sendMessage(deviceId: string, message: string): Promise<BluetoothSendResult> {
    return BluetoothLocalSync.sendMessage({ deviceId, message });
  }
}
