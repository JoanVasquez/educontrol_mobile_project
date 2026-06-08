import { Injectable, NgZone, inject } from '@angular/core';
import { registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';

type ConnectionType = 'wifi' | 'cellular' | 'none' | 'unknown';

interface ConnectionStatus {
  connected: boolean;
  connectionType: ConnectionType;
}

interface NetworkPlugin {
  getStatus(): Promise<ConnectionStatus>;
  addListener(eventName: 'networkStatusChange', listenerFunc: (status: ConnectionStatus) => void): Promise<PluginListenerHandle>;
}

const Network = registerPlugin<NetworkPlugin>('Network');

@Injectable({ providedIn: 'root' })
export class NetworkService {
  private readonly zone = inject(NgZone);
  private readonly statusSubject = new BehaviorSubject<ConnectionStatus>({
    connected: true,
    connectionType: 'unknown',
  });

  private listener: PluginListenerHandle | null = null;

  readonly status$ = this.statusSubject.asObservable();
  readonly isOnline$ = this.status$.pipe(
    map((status) => status.connected),
    distinctUntilChanged(),
  );

  constructor() {
    void this.initialize();
  }

  get currentStatus(): ConnectionStatus {
    return this.statusSubject.value;
  }

  get isOnline(): boolean {
    return this.currentStatus.connected;
  }

  private async initialize(): Promise<void> {
    const status = await Network.getStatus();
    this.updateStatus(status);

    this.listener = await Network.addListener('networkStatusChange', (networkStatus) => {
      this.zone.run(() => this.updateStatus(networkStatus));
    });
  }

  private updateStatus(status: ConnectionStatus): void {
    this.statusSubject.next(status);
  }
}
