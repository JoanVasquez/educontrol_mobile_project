import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, locationOutline } from 'ionicons/icons';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';

type Priority = 'low' | 'medium' | 'high';

@Component({
  selector: 'app-breakdown-report',
  templateUrl: './breakdown-report.page.html',
  styleUrls: ['./breakdown-report.page.scss'],
  imports: [AppBottomNavigationComponent, AppPageHeaderComponent, FormsModule, IonContent, IonIcon],
})
export class BreakdownReportPage {
  private readonly router = inject(Router);

  readonly categories = ['Electricidad', 'Plomería', 'Mobiliario', 'Climatización', 'Tecnología', 'Otra'];
  readonly priority = signal<Priority>('low');
  readonly photoName = signal('');
  readonly message = signal('');

  category = '';
  description = '';
  location = '';

  constructor() {
    addIcons({ cameraOutline, locationOutline });
  }

  selectPriority(priority: Priority): void {
    this.priority.set(priority);
    this.message.set('');
  }

  viewStatus(): void {
    this.router.navigateByUrl('/averias/estado');
  }

  selectPhoto(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.photoName.set(file?.name ?? '');
  }

  submit(): void {
    if (!this.category || !this.description.trim() || !this.location.trim()) {
      this.message.set('Completa la categoría, descripción y ubicación.');
      return;
    }

    const report = {
      category: this.category,
      description: this.description.trim(),
      priority: this.priority(),
      location: this.location.trim(),
      photoName: this.photoName(),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(`breakdown-report:${Date.now()}`, JSON.stringify(report));
    this.category = '';
    this.description = '';
    this.location = '';
    this.priority.set('low');
    this.photoName.set('');
    this.router.navigateByUrl('/averias/estado');
  }
}
