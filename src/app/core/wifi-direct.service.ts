import { Injectable } from '@angular/core';
import type { WifiDirectDevice } from './wifi-direct.plugin';
import WifiDirect from './wifi-direct.plugin';

@Injectable({ providedIn: 'root' })
export class WifiDirectService {
  async requestPermissions(): Promise<void> {
    await WifiDirect.requestPermissions();
  }

  async discoverPeers(): Promise<WifiDirectDevice[]> {
    const result = await WifiDirect.discoverPeers();
    return result.devices ?? [];
  }

  async getPeers(): Promise<WifiDirectDevice[]> {
    const result = await WifiDirect.getPeers();
    return result.devices ?? [];
  }

  async connect(deviceAddress: string): Promise<{ success: boolean; message: string }> {
    return WifiDirect.connect({ deviceAddress });
  }

  async sendPhoto(base64: string, filename: string): Promise<{ success: boolean; message: string }> {
    return WifiDirect.sendPhoto({ base64, filename });
  }
}
