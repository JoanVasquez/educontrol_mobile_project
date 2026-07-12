import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronForward,
  closeCircleOutline,
  helpBuoyOutline,
  notificationsOutline,
  peopleOutline,
  person,
  personAddOutline,
  schoolOutline,
  settingsOutline,
} from 'ionicons/icons';
import { AuthService } from '../core/auth/auth.service';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';

interface ProfileOption {
  icon: string;
  label: string;
  path?: string;
  action?: 'sign-out';
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [AppBottomNavigationComponent, AppPageHeaderComponent, AsyncPipe, IonContent, IonIcon, RouterLink, TitleCasePipe],
})
export class ProfilePage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly profile$ = this.authService.profile$;
  readonly options: ProfileOption[] = [
    { icon: 'school-outline', label: 'Estudiantes', path: '/estudiantes' },
    { icon: 'person-add-outline', label: 'Registro de estudiantes', path: '/registrar-estudiante' },
    { icon: 'settings-outline', label: 'Configuración' },
    { icon: 'people-outline', label: 'Usuarios' },
    { icon: 'notifications-outline', label: 'Notificaciones' },
    { icon: 'help-buoy-outline', label: 'Ayuda y soporte' },
    { icon: 'close-circle-outline', label: 'Cerrar Sesión', action: 'sign-out' },
  ];

  constructor() {
    addIcons({
      chevronForward,
      closeCircleOutline,
      helpBuoyOutline,
      notificationsOutline,
      peopleOutline,
      person,
      personAddOutline,
      schoolOutline,
      settingsOutline,
    });
  }

  selectOption(option: ProfileOption): void {
    if (option.action === 'sign-out') {
      this.authService.signOut();
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }
}
