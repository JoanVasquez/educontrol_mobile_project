import { registerPlugin } from '@capacitor/core';
import type { BluetoothDeviceSummary, BluetoothSendResult } from './bluetooth.model';

export interface BluetoothLocalSyncPlugin {
  requestPermissions(): Promise<void>;
  isAvailable(): Promise<{ available: boolean }>;
  discoverDevices(): Promise<{ devices: BluetoothDeviceSummary[] }>;
  connect(options: { deviceId: string }): Promise<BluetoothSendResult>;
  sendMessage(options: { deviceId: string; message: string }): Promise<BluetoothSendResult>;
}

const BluetoothLocalSync = registerPlugin<BluetoothLocalSyncPlugin>('BluetoothLocalSync', {
  web: () => import('./bluetooth.web').then((m) => new m.BluetoothWeb()),
});

export default BluetoothLocalSync;
