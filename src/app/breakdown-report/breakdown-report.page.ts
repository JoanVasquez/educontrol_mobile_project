import type { OnInit, OnDestroy } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import type { Priority } from '../core/models/breakdown.model';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';
import { BreakdownReportFacade } from './services/breakdown-report.facade';
import { registerBreakdownReportIcons } from './utils/breakdown-report-icons.util';
import { BREAKDOWN_CATEGORIES } from './utils/breakdown-report-options.util';

@Component({
  selector: 'app-breakdown-report',
  templateUrl: './breakdown-report.page.html',
  styleUrls: ['./breakdown-report.page.scss'],
  imports: [
    AppBottomNavigationComponent,
    AppPageHeaderComponent,
    FormsModule,
    IonContent,
    IonIcon,
    IonSpinner,
  ],
  providers: [BreakdownReportFacade],
})
export class BreakdownReportPage implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly facade = inject(BreakdownReportFacade);
  private readonly destroy$ = new Subject<void>();

  readonly categories = BREAKDOWN_CATEGORIES;
  readonly priority = signal<Priority>('low');
  readonly photoName = signal('');
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly isLoading = signal(false);

  category: (typeof BREAKDOWN_CATEGORIES)[number] | '' = '';
  description = '';
  location = '';

  constructor() {
    registerBreakdownReportIcons();
  }

  ngOnInit(): void {
    this.facade.error$.pipe(takeUntil(this.destroy$)).subscribe((error) => {
      if (error) {
        this.errorMessage.set(error);
      }
    });

    this.facade.success$.pipe(takeUntil(this.destroy$)).subscribe((success) => {
      if (success) {
        this.successMessage.set(success);
      }
    });

    this.facade.isLoading.pipe(takeUntil(this.destroy$)).subscribe((isLoading) => {
      this.isLoading.set(isLoading);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectPriority(priority: Priority): void {
    this.priority.set(priority);
    this.clearMessages();
  }

  viewStatus(): void {
    this.router.navigateByUrl('/averias/estado');
  }

  takePhoto(): void {
    this.facade.takePhoto().pipe(takeUntil(this.destroy$)).subscribe((photo) => {
      if (photo) {
        this.photoName.set(photo.name);
      }
    });
  }

  pickPhotoFromGallery(): void {
    this.facade.pickPhotoFromGallery().pipe(takeUntil(this.destroy$)).subscribe((photo) => {
      if (photo) {
        this.photoName.set(photo.name);
      }
    });
  }

  selectPhoto(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (this.facade.setPhoto(file)) {
        this.photoName.set(file.name);
      }
    }
  }

  submit(): void {
    if (!this.category || !this.description.trim() || !this.location.trim()) {
      this.errorMessage.set('Completa la categoría, descripción y ubicación.');
      return;
    }

    this.facade
      .submitBreakdownReport(
        this.category,
        this.description,
        this.priority(),
        this.location,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((breakdown) => {
        if (breakdown && breakdown.id) {
          this.resetForm();
          setTimeout(() => {
            this.router.navigateByUrl('/averias/estado');
          }, 1500);
        }
      });
  }

  private resetForm(): void {
    this.category = '';
    this.description = '';
    this.location = '';
    this.priority.set('low');
    this.photoName.set('');
    this.facade.clearPhoto();
  }

  clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
