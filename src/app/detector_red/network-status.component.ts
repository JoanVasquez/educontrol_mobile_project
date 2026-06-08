import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cloudDoneOutline, cloudOfflineOutline } from 'ionicons/icons';
import { NetworkService } from './network.service';

@Component({
  selector: 'app-network-status',
  templateUrl: './network-status.component.html',
  styleUrls: ['./network-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, IonIcon],
})
export class NetworkStatusComponent {
  private readonly networkService = inject(NetworkService);

  readonly status$ = this.networkService.status$;

  constructor() {
    addIcons({ cloudDoneOutline, cloudOfflineOutline });
  }
}
