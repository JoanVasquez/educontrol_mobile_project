import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircle,
  calendarNumberOutline,
  chevronForward,
  closeOutline,
  peopleCircleOutline,
  schoolOutline,
  todayOutline,
} from 'ionicons/icons';
import { AuthService } from '../core/auth/auth.service';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';
import { DashboardMetricCardComponent } from './components/dashboard-metric-card/dashboard-metric-card.component';
import { WeeklyAbsenceChartComponent, type WeeklyAbsencePoint } from './components/weekly-absence-chart/weekly-absence-chart.component';

interface DashboardMetric {
  icon: string;
  label: string;
  value: string;
  helper: string;
}

const DASHBOARD_METRICS: DashboardMetric[] = [
  { icon: 'student', label: 'Estudiantes inscritos', value: '512', helper: 'Total' },
  { icon: 'attendance', label: 'Asistencia del dia', value: '93%', helper: 'Presente' },
  { icon: 'absence', label: 'Ausencia del dia', value: '35', helper: 'Hoy' },
  { icon: 'teacher', label: 'Docentes activos', value: '24', helper: 'Total' },
];

const WEEKLY_ABSENCES: WeeklyAbsencePoint[] = [
  { label: 'Dia 1', value: 26 },
  { label: 'Dia 2', value: 18 },
  { label: 'Dia 3', value: -18 },
  { label: 'Dia 4', value: 8 },
  { label: 'Dia 5', value: 12 },
  { label: 'Dia 6', value: 30 },
];

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    AsyncPipe,
    TitleCasePipe,
    IonContent,
    IonIcon,
    AppBottomNavigationComponent,
    AppPageHeaderComponent,
    DashboardMetricCardComponent,
    WeeklyAbsenceChartComponent,
  ],
})
export class HomePage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly profile$ = this.authService.profile$;
  readonly metrics = DASHBOARD_METRICS;
  readonly weeklyAbsences = WEEKLY_ABSENCES;
  readonly todayLabel = new Intl.DateTimeFormat('es-DO', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric',
  }).format(new Date());

  constructor() {
    addIcons({
      alertCircle,
      calendarNumberOutline,
      chevronForward,
      closeOutline,
      peopleCircleOutline,
      schoolOutline,
      todayOutline,
    });
  }

  signOut(): void {
    this.authService.signOut();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
