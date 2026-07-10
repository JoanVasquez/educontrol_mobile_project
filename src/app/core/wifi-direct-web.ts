export class WifiDirectWeb {
  async requestPermissions(): Promise<void> {
    return;
  }

  async discoverPeers(): Promise<{ devices: Array<{ deviceName: string; deviceAddress: string }> }> {
    return { devices: [] };
  }

  async getPeers(): Promise<{ devices: Array<{ deviceName: string; deviceAddress: string }> }> {
    return { devices: [] };
  }

  async connect(): Promise<{ success: boolean; message: string }> {
    return { success: false, message: 'Wi-Fi Direct no es compatible en web' };
  }

  async sendPhoto(): Promise<{ success: boolean; message: string }> {
    return { success: false, message: 'Wi-Fi Direct no es compatible en web' };
  }
}
