import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircle,
  calendarNumberOutline,
  chevronForward,
  closeOutline,
  peopleCircleOutline,
  refreshOutline,
  schoolOutline,
  todayOutline,
} from 'ionicons/icons';
import { AuthService } from '../core/auth/auth.service';
import { APP_ROUTES } from '../core/constants/app-routes.constants';
import { DashboardService } from '../core/dashboard/dashboard.service';
import type { DashboardMetric, DashboardWeeklyPoint } from '../core/dashboard/dashboard.model';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';
import { DashboardMetricCardComponent } from './components/dashboard-metric-card/dashboard-metric-card.component';
import { WeeklyAbsenceChartComponent } from './components/weekly-absence-chart/weekly-absence-chart.component';

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
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly profile$ = this.authService.profile$;
  readonly metrics = signal<DashboardMetric[]>([]);
  readonly weeklyAbsences = signal<DashboardWeeklyPoint[]>([]);
  readonly pendingBreakdowns = signal(0);
  readonly isLoadingDashboard = signal(false);
  readonly isOfflineSource = signal(false);
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
      refreshOutline,
      schoolOutline,
      todayOutline,
    });
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoadingDashboard.set(true);

    this.dashboardService
      .load()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dashboard) => {
          this.metrics.set(dashboard.metrics);
          this.weeklyAbsences.set(dashboard.weeklyAbsences);
          this.pendingBreakdowns.set(dashboard.pendingBreakdowns);
          this.isOfflineSource.set(dashboard.source === 'cache');
          this.isLoadingDashboard.set(false);
        },
        error: () => {
          this.isLoadingDashboard.set(false);
          this.isOfflineSource.set(true);
        },
      });
  }

  openBreakdownStatus(): void {
    this.router.navigateByUrl(APP_ROUTES.breakdownStatus);
  }

  signOut(): void {
    this.authService.signOut();
    this.router.navigateByUrl(APP_ROUTES.login, { replaceUrl: true });
  }
}
