import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForward } from 'ionicons/icons';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';

type BreakdownState = 'pending' | 'in-progress' | 'resolved';
type BreakdownPriority = 'high' | 'medium' | 'low';

interface Breakdown {
  id: number;
  title: string;
  location: string;
  date: string;
  priority: BreakdownPriority;
  state: BreakdownState;
  image: string;
}

const BREAKDOWNS: Breakdown[] = [
  { id: 1, title: 'Inodoro Roto', location: 'Baño 1er nivel', date: '14 de mayo 2026', priority: 'high', state: 'pending', image: 'assets/breakdowns/toilet.svg' },
  { id: 2, title: 'Filtración baño', location: 'Baño 1er nivel', date: '14 de mayo 2026', priority: 'high', state: 'pending', image: 'assets/breakdowns/leak.svg' },
  { id: 3, title: 'Butaca Rota', location: 'Aula 312', date: '14 de mayo 2026', priority: 'medium', state: 'pending', image: 'assets/breakdowns/chair.svg' },
  { id: 4, title: 'Pintura desprendida', location: 'Aula 112', date: '14 de mayo 2026', priority: 'low', state: 'pending', image: 'assets/breakdowns/paint.svg' },
  { id: 5, title: 'Reparación eléctrica', location: 'Laboratorio', date: '13 de mayo 2026', priority: 'high', state: 'in-progress', image: 'assets/breakdowns/paint.svg' },
  { id: 6, title: 'Puerta reparada', location: 'Aula 204', date: '10 de mayo 2026', priority: 'medium', state: 'resolved', image: 'assets/breakdowns/chair.svg' },
];

@Component({
  selector: 'app-breakdown-status',
  templateUrl: './breakdown-status.page.html',
  styleUrls: ['./breakdown-status.page.scss'],
  imports: [AppBottomNavigationComponent, AppPageHeaderComponent, IonContent, IonIcon],
})
export class BreakdownStatusPage {
  private readonly router = inject(Router);

  readonly activeState = signal<BreakdownState>('pending');
  readonly visibleBreakdowns = computed(() => BREAKDOWNS.filter((breakdown) => breakdown.state === this.activeState()));

  constructor() {
    addIcons({ chevronForward });
  }

  selectState(state: BreakdownState): void {
    this.activeState.set(state);
  }

  openBreakdown(id: number): void {
    this.router.navigate(['/averias/actualizar', id]);
  }

  priorityLabel(priority: BreakdownPriority): string {
    return priority === 'high' ? 'Alta' : priority === 'medium' ? 'Media' : 'Baja';
  }
}
