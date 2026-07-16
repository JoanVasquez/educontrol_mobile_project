import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack, searchOutline } from 'ionicons/icons';
import { APP_ROUTES } from '../../../core/constants/app-routes.constants';

@Component({
  selector: 'app-page-header',
  templateUrl: './app-page-header.component.html',
  styleUrls: ['./app-page-header.component.scss'],
  imports: [IonButton, IonHeader, IonIcon, IonTitle, IonToolbar, RouterLink],
})
export class AppPageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly backUrl = input<string>(APP_ROUTES.home);
  readonly showBack = input<boolean>(true);
  readonly align = input<'center' | 'start'>('center');
  readonly color = input<'blue' | 'red'>('blue');
  readonly actionLabel = input<string>('');
  readonly actionIcon = input<string>('');
  readonly actionClicked = output<void>();

  constructor() {
    addIcons({ chevronBack, searchOutline });
  }

  handleAction(): void {
    this.actionClicked.emit();
  }
}
