import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { buildOutline, locationOutline, searchOutline } from 'ionicons/icons';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';

type BreakdownState = 'pending' | 'in-progress' | 'resolved';
type Priority = 'low' | 'medium' | 'high';

@Component({
  selector: 'app-breakdown-update',
  templateUrl: './breakdown-update.page.html',
  styleUrls: ['./breakdown-update.page.scss'],
  imports: [AppBottomNavigationComponent, AppPageHeaderComponent, FormsModule, IonContent, IonIcon],
})
export class BreakdownUpdatePage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly reportId = this.route.snapshot.paramMap.get('id') ?? '1';
  readonly message = signal('');

  category = 'Inodoro';
  priority: Priority = 'high';
  location = 'Baño 1er nivel';
  description = 'Tanque inodoro roto, filtra agua.';
  state: BreakdownState = 'in-progress';
  notes = 'Se realizó orden de compra de tanque nuevo, llega miércoles.';

  readonly categories = ['Inodoro', 'Plomería', 'Electricidad', 'Mobiliario', 'Pintura'];
  readonly priorities: Array<{ value: Priority; label: string }> = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
  ];
  readonly states: Array<{ value: BreakdownState; label: string }> = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'in-progress', label: 'En proceso' },
    { value: 'resolved', label: 'Resuelta' },
  ];

  constructor() {
    addIcons({ buildOutline, locationOutline, searchOutline });
  }

  search(): void {
    this.router.navigateByUrl('/averias/estado');
  }

  save(): void {
    const update = {
      id: this.reportId,
      category: this.category,
      priority: this.priority,
      location: this.location.trim(),
      description: this.description.trim(),
      state: this.state,
      notes: this.notes.trim(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`breakdown-update:${this.reportId}`, JSON.stringify(update));
    this.message.set('Cambios guardados correctamente.');
  }
}
