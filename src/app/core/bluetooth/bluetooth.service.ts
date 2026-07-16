import { Injectable } from '@angular/core';
import { BleClient, type ScanResult } from '@capacitor-community/bluetooth-le';
import type { BluetoothDeviceSummary, BluetoothSendResult } from './bluetooth.model';

const BLE_SCAN_DURATION_MS = 5000;
const BLE_CONNECT_TIMEOUT_MS = 8000;

@Injectable({ providedIn: 'root' })
export class BluetoothService {
  private initialized = false;

  async initializeBluetooth(): Promise<void> {
    if (this.initialized) return;

    await BleClient.initialize();
    this.initialized = true;
  }

  async requestPermissions(): Promise<void> {
    await this.initializeBluetooth();
    if (!(await BleClient.isEnabled())) {
      await BleClient.requestEnable();
    }
  }

  async isAvailable(): Promise<boolean> {
    await this.initializeBluetooth();
    return BleClient.isEnabled();
  }

  async discoverDevices(): Promise<BluetoothDeviceSummary[]> {
    await this.requestPermissions();
    const devices = new Map<string, BluetoothDeviceSummary>();

    await BleClient.requestLEScan({ allowDuplicates: false }, (result) => {
      const device = this.toDeviceSummary(result);
      devices.set(device.id, device);
    });

    await this.wait(BLE_SCAN_DURATION_MS);
    await BleClient.stopLEScan();

    return [...devices.values()];
  }

  async selectDeviceWithSystemPicker(): Promise<BluetoothDeviceSummary> {
    await this.requestPermissions();
    const device = await BleClient.requestDevice();

    return {
      id: device.deviceId,
      name: device.name || this.createFallbackDeviceName(device.deviceId),
    };
  }

  async connect(deviceId: string): Promise<BluetoothSendResult> {
    await this.requestPermissions();
    await BleClient.connect(deviceId, undefined, { timeout: BLE_CONNECT_TIMEOUT_MS });

    return {
      success: true,
      message: 'Dispositivo BLE conectado correctamente.',
    };
  }

  async testConnection(deviceId: string): Promise<BluetoothSendResult> {
    const result = await this.connect(deviceId);
    await BleClient.disconnect(deviceId);
    return result;
  }

  async sendMessage(deviceId: string, message: string): Promise<BluetoothSendResult> {
    await this.connect(deviceId);
    await BleClient.disconnect(deviceId);

    return {
      success: true,
      message: `Conexion BLE validada. Payload preparado para sincronizar (${message.length} caracteres).`,
    };
  }

  async openBluetoothSettings(): Promise<void> {
    await BleClient.openBluetoothSettings();
  }

  private toDeviceSummary(result: ScanResult): BluetoothDeviceSummary {
    const deviceName = result.localName || result.device.name || this.createFallbackDeviceName(result.device.deviceId);

    return {
      id: result.device.deviceId,
      name: deviceName,
      signalStrength: result.rssi,
    };
  }

  private createFallbackDeviceName(deviceId: string): string {
    const suffix = deviceId.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
    return suffix ? `Dispositivo BLE ${suffix}` : 'Dispositivo BLE sin nombre';
  }

  private wait(durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, durationMs);
    });
  }
}
