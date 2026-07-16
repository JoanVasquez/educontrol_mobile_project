import type { OnDestroy } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { IonButton, IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bluetoothOutline, checkmarkCircleOutline, linkOutline, refreshOutline, sendOutline, warningOutline } from 'ionicons/icons';
import { BluetoothService } from '../core/bluetooth/bluetooth.service';
import type { BluetoothDeviceSummary } from '../core/bluetooth/bluetooth.model';
import { LocalSyncService } from '../core/local-sync/local-sync.service';
import type { LocalSyncSummary } from '../core/local-sync/local-sync.model';
import { AutoDismissSignal } from '../core/utils/auto-dismiss-signal.util';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';

@Component({
  selector: 'app-local-sync',
  templateUrl: './local-sync.page.html',
  styleUrls: ['./local-sync.page.scss'],
  imports: [IonButton, IonContent, IonIcon, IonSpinner, AppBottomNavigationComponent, AppPageHeaderComponent],
})
export class LocalSyncPage implements OnDestroy {
  private readonly bluetooth = inject(BluetoothService);
  private readonly localSync = inject(LocalSyncService);
  private readonly successNotification = new AutoDismissSignal<string>((message) => this.successMessage.set(message), '');

  readonly devices = signal<BluetoothDeviceSummary[]>([]);
  readonly summary = signal<LocalSyncSummary>(this.localSync.getSummary());
  readonly selectedDeviceId = signal<string | null>(null);
  readonly isBluetoothAvailable = signal<boolean | null>(null);
  readonly isScanning = signal(false);
  readonly isConnecting = signal(false);
  readonly isSending = signal(false);
  readonly statusMessage = signal('Listo para sincronizar registros offline.');
  readonly successMessage = signal('');

  constructor() {
    addIcons({
      bluetoothOutline,
      checkmarkCircleOutline,
      linkOutline,
      refreshOutline,
      sendOutline,
      warningOutline,
    });
    void this.checkBluetoothAvailability();
  }

  ngOnDestroy(): void {
    this.successNotification.dispose();
  }

  async scanDevices(): Promise<void> {
    this.isScanning.set(true);
    this.successNotification.clear();
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

  async pickDevice(): Promise<void> {
    this.isScanning.set(true);
    this.successNotification.clear();
    this.statusMessage.set('Abriendo selector Bluetooth LE de Android...');

    try {
      const selectedDevice = await this.bluetooth.selectDeviceWithSystemPicker();
      this.devices.update((devices) => this.upsertDevice(devices, selectedDevice));
      this.selectedDeviceId.set(selectedDevice.id);
      this.statusMessage.set('Dispositivo seleccionado. Puedes probar la conexion o enviar pendientes.');
    } catch (error) {
      this.statusMessage.set(this.messageFromError(error));
    } finally {
      this.isScanning.set(false);
    }
  }

  selectDevice(deviceId: string): void {
    this.selectedDeviceId.set(deviceId);
    this.successNotification.clear();
  }

  async testConnection(): Promise<void> {
    const deviceId = this.selectedDeviceId();
    if (!deviceId) {
      this.statusMessage.set('Selecciona un dispositivo antes de probar la conexion.');
      return;
    }

    this.isConnecting.set(true);
    this.successNotification.clear();
    this.statusMessage.set('Validando conexion BLE...');

    try {
      const result = await this.bluetooth.testConnection(deviceId);
      this.statusMessage.set(result.message);
      if (result.success) this.successNotification.show('Conexion BLE validada.');
    } catch (error) {
      this.statusMessage.set(this.messageFromError(error));
    } finally {
      this.isConnecting.set(false);
    }
  }

  async sendPending(): Promise<void> {
    const deviceId = this.selectedDeviceId();
    if (!deviceId) {
      this.statusMessage.set('Selecciona un dispositivo antes de enviar.');
      return;
    }

    this.isSending.set(true);
    this.successNotification.clear();
    this.statusMessage.set('Enviando registros pendientes...');

    try {
      const result = await this.localSync.sendPending(deviceId);
      this.statusMessage.set(result.message);
      if (result.success) this.successNotification.show('Sincronizacion local enviada.');
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
    const message = error instanceof Error ? error.message : String(error);
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes('bluetooth') && normalizedMessage.includes('not enabled')) {
      return 'Bluetooth esta desactivado. Activalo desde Android y vuelve a intentar.';
    }

    if (normalizedMessage.includes('permission') || normalizedMessage.includes('denied')) {
      return 'Permiso Bluetooth denegado. Concede Dispositivos cercanos en Android.';
    }

    if (normalizedMessage.includes('timeout') || normalizedMessage.includes('connect') || normalizedMessage.includes('gatt')) {
      return 'No se pudo conectar con el dispositivo BLE. El receptor debe estar cerca, activo y anunciandose por Bluetooth LE.';
    }

    return message || 'No se pudo completar la sincronizacion local.';
  }

  private upsertDevice(devices: BluetoothDeviceSummary[], device: BluetoothDeviceSummary): BluetoothDeviceSummary[] {
    const existingIndex = devices.findIndex((currentDevice) => currentDevice.id === device.id);
    if (existingIndex === -1) return [...devices, device];

    return devices.map((currentDevice, index) => (index === existingIndex ? device : currentDevice));
  }
}
