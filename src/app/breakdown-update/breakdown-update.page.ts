import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { buildOutline, locationOutline, searchOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
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
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';

@Component({
  selector: 'app-breakdown-update',
  templateUrl: './breakdown-update.page.html',
  styleUrls: ['./breakdown-update.page.scss'],
  imports: [AppBottomNavigationComponent, AppPageHeaderComponent, FormsModule, IonContent, IonIcon, IonSpinner],
})
export class BreakdownUpdatePage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly updateService = inject(BreakdownUpdateService);

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

  search(): void {
    this.router.navigateByUrl('/averias/estado');
  }

  async reload(): Promise<void> {
    await this.load();
  }

  async save(): Promise<void> {
    if (!this.reportId || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.errorMessage.set('');

    try {
      const result = await firstValueFrom(this.updateService.save(this.reportId, this.currentForm()));
      this.applyViewModel(result);
      this.message.set('Cambios guardados correctamente.');
    } catch (error: unknown) {
      this.errorMessage.set(error instanceof Error ? error.message : 'No se pudieron guardar los cambios.');
    } finally {
      this.saving.set(false);
    }
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.message.set('');
    this.errorMessage.set('');

    if (!this.reportId) {
      this.errorMessage.set('No se encontró el identificador de la avería.');
      this.loading.set(false);
      return;
    }

    try {
      const result = await firstValueFrom(this.updateService.load(this.reportId));
      this.applyViewModel(result);
    } catch (error: unknown) {
      this.errorMessage.set(error instanceof Error ? error.message : 'No se pudo consultar la avería.');
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
