import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ellipsisHorizontal, person, searchOutline } from 'ionicons/icons';
import { APP_ROUTES } from '../core/constants/app-routes.constants';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';

interface Teacher {
  id: number;
  name: string;
  subject: string;
  courses: string;
}

const TEACHERS: Teacher[] = [
  { id: 1, name: 'Jessibel Pion', subject: 'Física', courses: '3ro A, 4to B' },
  { id: 2, name: 'Danna Vasquez', subject: 'Matemáticas', courses: '3ro A, 4to B' },
  { id: 3, name: 'Julia Rodriguez', subject: 'Química', courses: '3ro A, 4to B' },
  { id: 4, name: 'Oscar Martinez', subject: 'Ed. Física', courses: '3ro A, 4to B' },
  { id: 5, name: 'Luis Jimenez', subject: 'Literatura', courses: '3ro A, 4to B' },
  { id: 6, name: 'Daniel Concepcion', subject: 'Inglés', courses: '3ro A, 4to B' },
];

@Component({
  selector: 'app-teacher-list',
  templateUrl: './teacher-list.page.html',
  styleUrls: ['./teacher-list.page.scss'],
  imports: [AppBottomNavigationComponent, AppPageHeaderComponent, IonContent, IonIcon],
})
export class TeacherListPage {
  private readonly router = inject(Router);

  readonly searchTerm = signal('');
  readonly teachers = computed(() => {
    const query = this.normalize(this.searchTerm());
    return TEACHERS.filter((teacher) =>
      !query || this.normalize(`${teacher.name} ${teacher.subject} ${teacher.courses}`).includes(query),
    );
  });

  constructor() {
    addIcons({ ellipsisHorizontal, person, searchOutline });
  }

  search(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  editTeacher(id: number): void {
    this.router.navigate([APP_ROUTES.teacherEditor, id]);
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
}
