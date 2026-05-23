import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack } from 'ionicons/icons';

@Component({
  selector: 'app-page-header',
  templateUrl: './app-page-header.component.html',
  styleUrls: ['./app-page-header.component.scss'],
  imports: [IonButton, IonHeader, IonIcon, IonTitle, IonToolbar, RouterLink],
})
export class AppPageHeaderComponent {
  readonly title = input.required<string>();
  readonly backUrl = input<string>('/home');

  constructor() {
    addIcons({ chevronBack });
  }
}
