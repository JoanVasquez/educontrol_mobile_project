import type { OnDestroy } from '@angular/core';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForward } from 'ionicons/icons';
import { Subject, firstValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import type { BreakdownStatusListItem } from '../core/breakdowns/status/breakdown-status.model';
import { BreakdownStatusService } from '../core/breakdowns/status/breakdown-status.service';
import { DOMAIN_EVENTS } from '../core/events/domain-event.constants';
import { DomainEventBusService } from '../core/events/domain-event-bus.service';
import type { BreakdownStatus, Priority } from '../core/models/breakdown.model';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';

@Component({
  selector: 'app-breakdown-status',
  templateUrl: './breakdown-status.page.html',
  styleUrls: ['./breakdown-status.page.scss'],
  imports: [AppBottomNavigationComponent, AppPageHeaderComponent, IonContent, IonIcon, IonSpinner],
})
export class BreakdownStatusPage implements OnDestroy {
  private readonly router = inject(Router);
  private readonly statusService = inject(BreakdownStatusService);
  private readonly events = inject(DomainEventBusService);
  private readonly destroy$ = new Subject<void>();

  readonly activeState = signal<BreakdownStatus>('pending');
  readonly breakdowns = signal<BreakdownStatusListItem[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly visibleBreakdowns = computed(() =>
    this.breakdowns().filter((breakdown) => breakdown.status === this.activeState()),
  );

  constructor() {
    addIcons({ chevronForward });
    this.events.on(DOMAIN_EVENTS.breakdownChanged).pipe(takeUntil(this.destroy$)).subscribe(() => {
      void this.loadBreakdowns(false);
    });
    void this.loadBreakdowns();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectState(state: BreakdownStatus): void {
    this.activeState.set(state);
  }

  openBreakdown(id: string): void {
    this.router.navigate(['/averias/actualizar', id]);
  }

  priorityLabel(priority: Priority): string {
    return this.statusService.priorityLabel(priority);
  }

  statusLabel(status: BreakdownStatus): string {
    return this.statusService.statusLabel(status);
  }

  async reload(): Promise<void> {
    await this.loadBreakdowns();
  }

  private async loadBreakdowns(showLoader = true): Promise<void> {
    if (showLoader) this.loading.set(true);
    this.errorMessage.set('');

    try {
      const result = await firstValueFrom(this.statusService.load());
      this.breakdowns.set(result.items);
    } catch (error: unknown) {
      this.breakdowns.set([]);
      this.errorMessage.set(error instanceof Error ? error.message : 'No se pudieron consultar las averías.');
    } finally {
      if (showLoader) this.loading.set(false);
    }
  }
}
