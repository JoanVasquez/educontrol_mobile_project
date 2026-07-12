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
  radioOutline,
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

const ADMIN_DIRECTOR_ROLES: UserRole[] = ['admin', 'director'];
const AUTHENTICATED_ROLES: UserRole[] = ['admin', 'director', 'docente'];

const PRIMARY_ITEMS: NavigationItem[] = [
  { icon: 'home-outline', label: 'Inicio', path: '/home', roles: ADMIN_DIRECTOR_ROLES },
  { icon: 'calendar-outline', label: 'Asistencia', path: '/asistencia', roles: AUTHENTICATED_ROLES },
  { icon: 'build-outline', label: 'Averias', path: '/averias', roles: AUTHENTICATED_ROLES },
  { icon: 'people-outline', label: 'Docentes', path: '/docentes', roles: ADMIN_DIRECTOR_ROLES },
];

const MORE_ITEMS: NavigationItem[] = [
  { icon: 'person-circle-outline', label: 'Mi perfil', path: '/perfil' },
  { icon: 'radio-outline', label: 'Sincronizacion local', path: '/sincronizacion-local' },
  { icon: 'location-outline', label: 'Ubicación y lugares', path: '/ubicacion' },
  { icon: 'school-outline', label: 'Estudiantes', path: '/estudiantes', roles: ADMIN_DIRECTOR_ROLES },
  { icon: 'person-add-outline', label: 'Registrar estudiante', path: '/registrar-estudiante', roles: ADMIN_DIRECTOR_ROLES },
  { icon: 'build-outline', label: 'Reportar averia', path: '/averias', roles: AUTHENTICATED_ROLES },
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
      radioOutline,
      peopleOutline,
      personCircleOutline,
      personAddOutline,
      schoolOutline,
    });
  }

  moreItemsForRole(role: UserRole): NavigationItem[] {
    return this.itemsForRole(MORE_ITEMS, role);
  }

  primaryItemsForRole(role: UserRole): NavigationItem[] {
    return this.itemsForRole(PRIMARY_ITEMS, role);
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

  private itemsForRole(items: NavigationItem[], role: UserRole): NavigationItem[] {
    return items.filter((item) => !item.roles || item.roles.includes(role));
  }
}
