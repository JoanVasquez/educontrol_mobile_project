import { Injectable, inject, signal } from '@angular/core';
import type { WifiDirectDevice } from '../../core/wifi-direct.plugin';
import { WifiDirectService } from '../../core/wifi-direct.service';

@Injectable({ providedIn: 'root' })
export class StudentWifiDirectShareService {
  private readonly wifiDirectService = inject(WifiDirectService);

  readonly peerDevices = signal<WifiDirectDevice[]>([]);
  readonly message = signal<string | null>(null);
  readonly scanning = signal(false);
  readonly sharing = signal(false);

  async scanPeers(): Promise<void> {
    this.scanning.set(true);
    this.message.set(null);

    try {
      await this.wifiDirectService.requestPermissions();
      const peers = await this.wifiDirectService.discoverPeers();
      this.peerDevices.set(peers);
      this.message.set(peers.length > 0 ? `${peers.length} peer(s) encontrados` : 'No se encontraron peers Wi-Fi Direct');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : String(error));
    } finally {
      this.scanning.set(false);
    }
  }

  async connectPeer(deviceAddress: string): Promise<void> {
    this.message.set(null);

    try {
      const result = await this.wifiDirectService.connect(deviceAddress);
      this.message.set(result.message);
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : String(error));
    }
  }

  async sharePhoto(photo: File | null): Promise<void> {
    if (!photo) {
      this.message.set('Selecciona primero una foto para compartir.');
      return;
    }

    this.sharing.set(true);
    this.message.set(null);

    try {
      const result = await this.wifiDirectService.sendPhoto(await this.readFileAsBase64(photo), photo.name || 'photo.jpg');
      this.message.set(result.message);
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : String(error));
    } finally {
      this.sharing.set(false);
    }
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => this.resolveReaderResult(reader.result, resolve, reject);
      reader.onerror = () => reject(new Error('Error leyendo la imagen'));
      reader.readAsDataURL(file);
    });
  }

  private resolveReaderResult(
    result: string | ArrayBuffer | null,
    resolve: (value: string) => void,
    reject: (reason?: unknown) => void,
  ): void {
    if (typeof result !== 'string') {
      reject(new Error('No se pudo leer la imagen'));
      return;
    }

    const commaIndex = result.indexOf(',');
    resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
  }
}
