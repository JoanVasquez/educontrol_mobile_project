import { registerPlugin } from '@capacitor/core';

export interface WifiDirectDevice {
  deviceName: string;
  deviceAddress: string;
}

export interface WifiDirectPlugin {
  requestPermissions(): Promise<void>;
  discoverPeers(): Promise<{ devices: WifiDirectDevice[] }>;
  getPeers(): Promise<{ devices: WifiDirectDevice[] }>;
  connect(options: { deviceAddress: string }): Promise<{ success: boolean; message: string }>;
  sendPhoto(options: { base64: string; filename: string }): Promise<{ success: boolean; message: string }>;
}

const WifiDirect = registerPlugin<WifiDirectPlugin>('WifiDirect', {
  web: () => import('./wifi-direct-web').then((m) => new m.WifiDirectWeb()),
});

export default WifiDirect;
