import type { OnInit, OnDestroy } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, locationOutline, imageOutline, cloudUploadOutline } from 'ionicons/icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';
import { BreakdownReportFacade } from './services/breakdown-report.facade';
import type { BreakdownCategory, Priority } from '../core/models/breakdown.model';

/**
 * Breakdown Report Page Component
 * Implements Clean Code and SOLID principles:
 * - Single Responsibility: Only handles presentation logic
 * - Dependency Injection: Services injected through constructor
 * - Reactive Programming: Uses Observables and signals for state management
 * - Separation of Concerns: Business logic delegated to facade/services
 */
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

  // Form data
  readonly categories: BreakdownCategory[] = [
    'Electricidad',
    'Plomería',
    'Mobiliario',
    'Climatización',
    'Tecnología',
    'Otra',
  ];

  readonly priority = signal<Priority>('low');
  readonly photoName = signal('');

  // Messages and loading states
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly isLoading = signal(false);

  // Form field values
  category: BreakdownCategory | '' = '';
  description = '';
  location = '';

  constructor() {
    addIcons({ cameraOutline, locationOutline, imageOutline, cloudUploadOutline });
  }

  ngOnInit(): void {
    // Subscribe to facade observables
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

  /**
   * Handle priority selection
   */
  selectPriority(priority: Priority): void {
    this.priority.set(priority);
    this.clearMessages();
  }

  /**
   * Navigate to breakdown status page
   */
  viewStatus(): void {
    this.router.navigateByUrl('/averias/estado');
  }

  /**
   * Trigger camera to take a photo
   */
  takePhoto(): void {
    this.facade.takePhoto().pipe(takeUntil(this.destroy$)).subscribe((photo) => {
      if (photo) {
        this.photoName.set(photo.name);
      }
    });
  }

  /**
   * Pick a photo from gallery
   */
  pickPhotoFromGallery(): void {
    this.facade.pickPhotoFromGallery().pipe(takeUntil(this.destroy$)).subscribe((photo) => {
      if (photo) {
        this.photoName.set(photo.name);
      }
    });
  }

  /**
   * Handle file input selection (fallback for web)
   */
  selectPhoto(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (this.facade.setPhoto(file)) {
        this.photoName.set(file.name);
      }
    }
  }

  /**
   * Submit the breakdown report to Firebase
   */
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
          // Navigate after a short delay to show success message
          setTimeout(() => {
            this.router.navigateByUrl('/averias/estado');
          }, 1500);
        }
      });
  }

  /**
   * Reset the form to initial state
   */
  private resetForm(): void {
    this.category = '';
    this.description = '';
    this.location = '';
    this.priority.set('low');
    this.photoName.set('');
    this.facade.clearPhoto();
  }

  /**
   * Clear error and success messages
   */
  clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
