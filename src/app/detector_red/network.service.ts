import { Injectable, NgZone, inject } from '@angular/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { Network } from '@capacitor/network';
import type { ConnectionStatus } from '@capacitor/network';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';

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
    try {
      const status = await Network.getStatus();
      this.updateStatus(status);

      this.listener = await Network.addListener('networkStatusChange', (networkStatus) => {
        this.zone.run(() => this.updateStatus(networkStatus));
      });
    } catch (error) {
      console.warn('No se pudo inicializar el monitor de red:', error);
      this.updateStatus({
        connected: typeof navigator === 'undefined' ? true : navigator.onLine,
        connectionType: 'unknown',
      });
    }
  }

  private updateStatus(status: ConnectionStatus): void {
    this.statusSubject.next(status);
  }
}
