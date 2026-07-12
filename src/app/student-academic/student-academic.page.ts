import { Component, computed, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonIcon, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { refreshOutline, schoolOutline, searchOutline } from 'ionicons/icons';
import { ACADEMIC_COURSES, getAcademicSubjectsByCourse } from '../core/academic/academic-course.catalog';
import { AuthService } from '../core/auth/auth.service';
import { StudentAcademicService } from '../core/students/student-academic.service';
import type { StudentAcademicRecord } from '../core/students/student-academic.model';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';

@Component({
  selector: 'app-student-academic',
  templateUrl: './student-academic.page.html',
  styleUrls: ['./student-academic.page.scss'],
  imports: [
    AppBottomNavigationComponent,
    AppPageHeaderComponent,
    AsyncPipe,
    FormsModule,
    IonButton,
    IonContent,
    IonIcon,
    IonSelect,
    IonSelectOption,
  ],
})
export class StudentAcademicPage {
  private readonly authService = inject(AuthService);
  private readonly studentAcademicService = inject(StudentAcademicService);

  readonly courses = ACADEMIC_COURSES;
  readonly profile$ = this.authService.profile$;
  readonly students = signal<StudentAcademicRecord[]>([]);
  readonly loading = signal(true);
  readonly savingId = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly visibleStudents = computed(() => {
    const query = this.normalize(this.searchTerm());

    return this.students().filter((student) => {
      const text = `${student.fullName} ${student.course} ${student.subjects.join(' ')}`;
      return !query || this.normalize(text).includes(query);
    });
  });

  constructor() {
    addIcons({ refreshOutline, schoolOutline, searchOutline });
    this.loadStudents();
  }

  search(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  loadStudents(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.studentAcademicService.load().subscribe({
      next: (students) => this.students.set(students),
      error: (error: unknown) => {
        this.students.set([]);
        this.errorMessage.set(error instanceof Error ? error.message : 'No se pudo cargar el listado de estudiantes.');
      },
      complete: () => this.loading.set(false),
    });
  }

  changeCourse(student: StudentAcademicRecord, course: string): void {
    if (!course || course === student.course || this.savingId()) {
      return;
    }

    this.savingId.set(student.id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.studentAcademicService.changeCourse(student.id, course).subscribe({
      next: () => {
        this.students.update((students) =>
          students.map((item) =>
            item.id === student.id
              ? {
                  ...item,
                  course,
                  subjects: getAcademicSubjectsByCourse(course),
                  updatedAt: new Date().toISOString(),
                }
              : item,
          ),
        );
        this.successMessage.set('Curso y asignaturas actualizados.');
      },
      error: (error: unknown) => {
        this.errorMessage.set(error instanceof Error ? error.message : 'No se pudo actualizar el curso.');
      },
      complete: () => this.savingId.set(null),
    });
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
}
