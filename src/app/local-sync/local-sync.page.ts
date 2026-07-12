import { Component, inject, signal } from '@angular/core';
import { IonButton, IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bluetoothOutline, checkmarkCircleOutline, refreshOutline, sendOutline, warningOutline } from 'ionicons/icons';
import { BluetoothService } from '../core/bluetooth/bluetooth.service';
import type { BluetoothDeviceSummary } from '../core/bluetooth/bluetooth.model';
import { LocalSyncService } from '../core/local-sync/local-sync.service';
import type { LocalSyncSummary } from '../core/local-sync/local-sync.model';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';

@Component({
  selector: 'app-local-sync',
  templateUrl: './local-sync.page.html',
  styleUrls: ['./local-sync.page.scss'],
  imports: [IonButton, IonContent, IonIcon, IonSpinner, AppBottomNavigationComponent, AppPageHeaderComponent],
})
export class LocalSyncPage {
  private readonly bluetooth = inject(BluetoothService);
  private readonly localSync = inject(LocalSyncService);

  readonly devices = signal<BluetoothDeviceSummary[]>([]);
  readonly summary = signal<LocalSyncSummary>(this.localSync.getSummary());
  readonly selectedDeviceId = signal<string | null>(null);
  readonly isBluetoothAvailable = signal<boolean | null>(null);
  readonly isScanning = signal(false);
  readonly isSending = signal(false);
  readonly statusMessage = signal('Listo para sincronizar registros offline.');
  readonly successMessage = signal('');

  constructor() {
    addIcons({
      bluetoothOutline,
      checkmarkCircleOutline,
      refreshOutline,
      sendOutline,
      warningOutline,
    });
    void this.checkBluetoothAvailability();
  }

  async scanDevices(): Promise<void> {
    this.isScanning.set(true);
    this.successMessage.set('');
    this.statusMessage.set('Buscando dispositivos cercanos...');

    try {
      const devices = await this.bluetooth.discoverDevices();
      this.devices.set(devices);
      this.statusMessage.set(devices.length ? 'Selecciona un dispositivo para sincronizar.' : 'No se encontraron dispositivos.');
    } catch (error) {
      this.statusMessage.set(this.messageFromError(error));
    } finally {
      this.isScanning.set(false);
      this.summary.set(this.localSync.getSummary());
    }
  }

  selectDevice(deviceId: string): void {
    this.selectedDeviceId.set(deviceId);
    this.successMessage.set('');
  }

  async sendPending(): Promise<void> {
    const deviceId = this.selectedDeviceId();
    if (!deviceId) {
      this.statusMessage.set('Selecciona un dispositivo antes de enviar.');
      return;
    }

    this.isSending.set(true);
    this.successMessage.set('');
    this.statusMessage.set('Enviando registros pendientes...');

    try {
      const result = await this.localSync.sendPending(deviceId);
      this.statusMessage.set(result.message);
      this.successMessage.set(result.success ? 'Sincronizacion local enviada.' : '');
    } catch (error) {
      this.statusMessage.set(this.messageFromError(error));
    } finally {
      this.isSending.set(false);
      this.summary.set(this.localSync.getSummary());
    }
  }

  private async checkBluetoothAvailability(): Promise<void> {
    try {
      this.isBluetoothAvailable.set(await this.bluetooth.isAvailable());
    } catch {
      this.isBluetoothAvailable.set(false);
    }
  }

  private messageFromError(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudo completar la sincronizacion local.';
  }
}
