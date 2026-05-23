import { AsyncPipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  buildOutline,
  calendarOutline,
  ellipsisHorizontal,
  homeOutline,
  peopleOutline,
  personAddOutline,
  schoolOutline,
} from 'ionicons/icons';
import type { UserRole } from '../../../core/users/user-profile.model';
import { AuthService } from '../../../core/auth/auth.service';

interface NavigationItem {
  icon: string;
  label: string;
  path: string;
  roles?: UserRole[];
}

const PRIMARY_ITEMS: NavigationItem[] = [
  { icon: 'home-outline', label: 'Inicio', path: '/home' },
  { icon: 'calendar-outline', label: 'Asistencia', path: '/asistencia' },
  { icon: 'build-outline', label: 'Averias', path: '/averias' },
  { icon: 'people-outline', label: 'Docentes', path: '/docentes' },
];

const MORE_ITEMS: NavigationItem[] = [
  { icon: 'person-add-outline', label: 'Registrar estudiante', path: '/registrar-estudiante', roles: ['admin', 'director', 'secretaria'] },
  { icon: 'build-outline', label: 'Reportar averia', path: '/home', roles: ['admin', 'director', 'docente'] },
];

@Component({
  selector: 'app-bottom-navigation',
  templateUrl: './app-bottom-navigation.component.html',
  styleUrls: ['./app-bottom-navigation.component.scss'],
  imports: [AsyncPipe, IonIcon, RouterLink],
})
export class AppBottomNavigationComponent {
  private readonly authService = inject(AuthService);

  readonly activePath = input<string>('/home');
  readonly profile$ = this.authService.profile$;
  readonly primaryItems = PRIMARY_ITEMS;
  readonly moreOpen = signal(false);

  constructor() {
    addIcons({
      buildOutline,
      calendarOutline,
      ellipsisHorizontal,
      homeOutline,
      peopleOutline,
      personAddOutline,
      schoolOutline,
    });
  }

  moreItemsForRole(role: UserRole): NavigationItem[] {
    return MORE_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
  }

  toggleMore(): void {
    this.moreOpen.update((isOpen) => !isOpen);
  }

  closeMore(): void {
    this.moreOpen.set(false);
  }

  isActive(path: string): boolean {
    return this.activePath() === path;
  }
}
