import { Component, Input, inject } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';
import { StudentWifiDirectShareService } from '../../services/student-wifi-direct-share.service';

@Component({
  selector: 'app-student-wifi-share',
  templateUrl: './student-wifi-share.component.html',
  imports: [IonButton],
})
export class StudentWifiShareComponent {
  private readonly wifiShare = inject(StudentWifiDirectShareService);

  @Input() selectedPhoto: File | null = null;

  readonly peerDevices = this.wifiShare.peerDevices;
  readonly wifiDirectMessage = this.wifiShare.message;
  readonly isScanningPeers = this.wifiShare.scanning;
  readonly shareLoading = this.wifiShare.sharing;

  async scanPeers(): Promise<void> { await this.wifiShare.scanPeers(); }

  async connectPeer(deviceAddress: string): Promise<void> { await this.wifiShare.connectPeer(deviceAddress); }

  async sharePhoto(): Promise<void> { await this.wifiShare.sharePhoto(this.selectedPhoto); }
}
