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
  locationOutline,
  peopleOutline,
  personCircleOutline,
  personAddOutline,
  schoolOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../core/auth/auth.service';
import type { UserRole } from '../../../core/users/user-profile.model';

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
  { icon: 'person-circle-outline', label: 'Mi perfil', path: '/perfil' },
  { icon: 'location-outline', label: 'Ubicación y lugares', path: '/ubicacion' },
  { icon: 'person-add-outline', label: 'Registrar estudiante', path: '/registrar-estudiante', roles: ['admin', 'director', 'secretaria'] },
  { icon: 'build-outline', label: 'Reportar averia', path: '/averias', roles: ['admin', 'director', 'docente'] },
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
  readonly color = input<'blue' | 'red'>('blue');
  readonly profile$ = this.authService.profile$;
  readonly primaryItems = PRIMARY_ITEMS;
  readonly moreOpen = signal(false);
  readonly attendanceOpen = signal(false);
  readonly breakdownOpen = signal(false);
  readonly teachersOpen = signal(false);

  constructor() {
    addIcons({
      buildOutline,
      calendarOutline,
      ellipsisHorizontal,
      homeOutline,
      locationOutline,
      peopleOutline,
      personCircleOutline,
      personAddOutline,
      schoolOutline,
    });
  }

  moreItemsForRole(role: UserRole): NavigationItem[] {
    return MORE_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
  }

  toggleMore(): void {
    this.attendanceOpen.set(false);
    this.breakdownOpen.set(false);
    this.teachersOpen.set(false);
    this.moreOpen.update((isOpen) => !isOpen);
  }

  closeMore(): void {
    this.moreOpen.set(false);
    this.attendanceOpen.set(false);
    this.breakdownOpen.set(false);
    this.teachersOpen.set(false);
  }

  toggleAttendance(): void {
    this.moreOpen.set(false);
    this.breakdownOpen.set(false);
    this.teachersOpen.set(false);
    this.attendanceOpen.update((isOpen) => !isOpen);
  }

  toggleBreakdown(): void {
    this.moreOpen.set(false);
    this.attendanceOpen.set(false);
    this.teachersOpen.set(false);
    this.breakdownOpen.update((isOpen) => !isOpen);
  }

  toggleTeachers(): void {
    this.moreOpen.set(false);
    this.attendanceOpen.set(false);
    this.breakdownOpen.set(false);
    this.teachersOpen.update((isOpen) => !isOpen);
  }

  isActive(path: string): boolean {
    if (path === '/asistencia' || path === '/averias' || path === '/docentes') {
      return this.activePath().startsWith(path);
    }
    return this.activePath() === path;
  }
}
