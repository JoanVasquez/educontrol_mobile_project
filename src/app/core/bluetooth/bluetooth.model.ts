export interface BluetoothDeviceSummary {
  id: string;
  name: string;
  signalStrength?: number;
}

export interface BluetoothSendResult {
  success: boolean;
  message: string;
}

export type BluetoothAvailability = 'available' | 'unavailable';
