import { Component, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { OfflineFirstSyncService } from './core/offline/offline-first-sync.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private readonly offlineFirstSync = inject(OfflineFirstSyncService);

  constructor() {
    this.configureStatusBar();
    this.offlineFirstSync.start();
  }

  private async configureStatusBar(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#3158ad' });
    await StatusBar.setOverlaysWebView({ overlay: false });
  }
}
