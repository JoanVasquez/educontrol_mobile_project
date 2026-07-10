import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ellipsisHorizontal, person, refreshOutline, searchOutline } from 'ionicons/icons';
import { TeacherListService } from '../core/teachers/teacher-list.service';
import type { TeacherListItem } from '../core/teachers/teacher.model';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';

@Component({
  selector: 'app-teacher-directory',
  templateUrl: './teacher-directory.page.html',
  styleUrls: ['./teacher-directory.page.scss'],
  imports: [AppBottomNavigationComponent, AppPageHeaderComponent, IonContent, IonIcon],
})
export class TeacherDirectoryPage {
  private readonly router = inject(Router);
  private readonly teacherListService = inject(TeacherListService);

  readonly searchTerm = signal('');
  readonly allTeachers = signal<TeacherListItem[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly showingCache = signal(false);

  readonly teachers = computed(() => {
    const query = this.normalize(this.searchTerm());
    return this.allTeachers().filter(
      (teacher) =>
        !query ||
        this.normalize(`${teacher.fullName} ${teacher.subjectLabel} ${teacher.courseLabel}`).includes(query),
    );
  });

  constructor() {
    addIcons({ ellipsisHorizontal, person, refreshOutline, searchOutline });
    this.loadTeachers();
  }

  search(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  reload(): void {
    this.loadTeachers();
  }

  editTeacher(id: string): void {
    this.router.navigate(['/docentes/modificar', id]);
  }

  private loadTeachers(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.teacherListService.load().subscribe({
      next: (result) => {
        this.allTeachers.set(result.teachers);
        this.showingCache.set(result.source === 'cache');
      },
      error: (error: unknown) => {
        this.allTeachers.set([]);
        this.showingCache.set(false);
        this.errorMessage.set(error instanceof Error ? error.message : 'No se pudo cargar el listado de docentes.');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
}
