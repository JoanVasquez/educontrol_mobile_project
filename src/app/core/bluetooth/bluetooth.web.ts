import type { BluetoothDeviceSummary, BluetoothSendResult } from './bluetooth.model';
import type { BluetoothLocalSyncPlugin } from './bluetooth.plugin';

export class BluetoothWeb implements BluetoothLocalSyncPlugin {
  async requestPermissions(): Promise<void> {
    return;
  }

  async isAvailable(): Promise<{ available: boolean }> {
    return { available: false };
  }

  async discoverDevices(): Promise<{ devices: BluetoothDeviceSummary[] }> {
    return { devices: [] };
  }

  async connect(): Promise<BluetoothSendResult> {
    return this.unsupported();
  }

  async sendMessage(): Promise<BluetoothSendResult> {
    return this.unsupported();
  }

  private unsupported(): BluetoothSendResult {
    return {
      success: false,
      message: 'Bluetooth local requiere una implementación nativa en Android.',
    };
  }
}
