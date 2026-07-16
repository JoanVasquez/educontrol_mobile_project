import type { OnDestroy } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { buildOutline, locationOutline, searchOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { APP_ROUTES } from '../core/constants/app-routes.constants';
import { BREAKDOWN_MESSAGES } from '../core/constants/ui-messages.constants';
import type {
  BreakdownUpdateForm,
  BreakdownUpdateSummary,
} from '../core/breakdowns/update/breakdown-update.model';
import {
  BREAKDOWN_CATEGORY_OPTIONS,
  BREAKDOWN_PRIORITY_OPTIONS,
  BREAKDOWN_STATUS_OPTIONS,
} from '../core/breakdowns/update/breakdown-update.options';
import { BreakdownUpdateService } from '../core/breakdowns/update/breakdown-update.service';
import type { BreakdownCategory, BreakdownStatus, Priority } from '../core/models/breakdown.model';
import { AutoDismissSignal } from '../core/utils/auto-dismiss-signal.util';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';

@Component({
  selector: 'app-breakdown-update',
  templateUrl: './breakdown-update.page.html',
  styleUrls: ['./breakdown-update.page.scss'],
  imports: [AppBottomNavigationComponent, AppPageHeaderComponent, FormsModule, IonContent, IonIcon, IonSpinner],
})
export class BreakdownUpdatePage implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly updateService = inject(BreakdownUpdateService);
  private readonly messageNotification = new AutoDismissSignal<string>((message) => this.message.set(message), '');
  private readonly errorNotification = new AutoDismissSignal<string>((message) => this.errorMessage.set(message), '');

  readonly reportId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly message = signal('');
  readonly errorMessage = signal('');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly summary = signal<BreakdownUpdateSummary | null>(null);

  category: BreakdownCategory = 'Otra';
  priority: Priority = 'low';
  location = '';
  description = '';
  status: BreakdownStatus = 'pending';
  notes = '';

  readonly categories = BREAKDOWN_CATEGORY_OPTIONS;
  readonly priorities = BREAKDOWN_PRIORITY_OPTIONS;
  readonly states = BREAKDOWN_STATUS_OPTIONS;

  constructor() {
    addIcons({ buildOutline, locationOutline, searchOutline });
    void this.load();
  }

  ngOnDestroy(): void {
    this.messageNotification.dispose();
    this.errorNotification.dispose();
  }

  search(): void {
    this.router.navigateByUrl(APP_ROUTES.breakdownStatus);
  }

  async reload(): Promise<void> {
    await this.load();
  }

  async save(): Promise<void> {
    if (!this.reportId || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.messageNotification.clear();
    this.errorNotification.clear();

    try {
      const result = await firstValueFrom(this.updateService.save(this.reportId, this.currentForm()));
      this.applyViewModel(result);
      this.messageNotification.show(BREAKDOWN_MESSAGES.saveSuccess);
    } catch (error: unknown) {
      this.errorNotification.show(error instanceof Error ? error.message : BREAKDOWN_MESSAGES.saveError);
    } finally {
      this.saving.set(false);
    }
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.messageNotification.clear();
    this.errorNotification.clear();

    if (!this.reportId) {
      this.errorMessage.set(BREAKDOWN_MESSAGES.missingId);
      this.loading.set(false);
      return;
    }

    try {
      const result = await firstValueFrom(this.updateService.load(this.reportId));
      this.applyViewModel(result);
    } catch (error: unknown) {
      this.errorMessage.set(error instanceof Error ? error.message : BREAKDOWN_MESSAGES.loadError);
    } finally {
      this.loading.set(false);
    }
  }

  private applyViewModel(viewModel: { form: BreakdownUpdateForm; summary: BreakdownUpdateSummary }): void {
    this.category = viewModel.form.category;
    this.priority = viewModel.form.priority;
    this.location = viewModel.form.location;
    this.description = viewModel.form.description;
    this.status = viewModel.form.status;
    this.notes = viewModel.form.notes;
    this.summary.set(viewModel.summary);
  }

  private currentForm(): BreakdownUpdateForm {
    return {
      category: this.category,
      priority: this.priority,
      location: this.location,
      description: this.description,
      status: this.status,
      notes: this.notes,
    };
  }
}
