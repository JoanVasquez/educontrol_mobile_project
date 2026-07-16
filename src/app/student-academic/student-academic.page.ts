import type { OnDestroy } from '@angular/core';
import { Component, computed, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonIcon, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { refreshOutline, schoolOutline, searchOutline } from 'ionicons/icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ACADEMIC_COURSES, getAcademicSubjectsByCourse } from '../core/academic/academic-course.catalog';
import { AuthService } from '../core/auth/auth.service';
import { STUDENT_MESSAGES } from '../core/constants/ui-messages.constants';
import { DOMAIN_EVENTS } from '../core/events/domain-event.constants';
import { DomainEventBusService } from '../core/events/domain-event-bus.service';
import { StudentAcademicService } from '../core/students/student-academic.service';
import type { StudentAcademicRecord } from '../core/students/student-academic.model';
import { AutoDismissSignal } from '../core/utils/auto-dismiss-signal.util';
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
export class StudentAcademicPage implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly studentAcademicService = inject(StudentAcademicService);
  private readonly events = inject(DomainEventBusService);
  private readonly destroy$ = new Subject<void>();
  private readonly errorNotification = new AutoDismissSignal<string>((message) => this.errorMessage.set(message), '');
  private readonly successNotification = new AutoDismissSignal<string>((message) => this.successMessage.set(message), '');

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
    this.events.on(DOMAIN_EVENTS.studentChanged).pipe(takeUntil(this.destroy$)).subscribe(() => this.loadStudents(false));
    this.loadStudents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.errorNotification.dispose();
    this.successNotification.dispose();
  }

  search(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  loadStudents(showLoader = true): void {
    if (showLoader) {
      this.loading.set(true);
      this.errorNotification.clear();
      this.successNotification.clear();
    }

    this.studentAcademicService.load().subscribe({
      next: (students) => this.students.set(students),
      error: (error: unknown) => {
        this.students.set([]);
        this.errorMessage.set(error instanceof Error ? error.message : STUDENT_MESSAGES.loadError);
      },
      complete: () => {
        if (showLoader) this.loading.set(false);
      },
    });
  }

  changeCourse(student: StudentAcademicRecord, course: string): void {
    if (!course || course === student.course || this.savingId()) {
      return;
    }

    this.savingId.set(student.id);
    this.errorNotification.clear();
    this.successNotification.clear();

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
        this.successNotification.show(STUDENT_MESSAGES.courseChanged);
      },
      error: (error: unknown) => {
        this.errorNotification.show(error instanceof Error ? error.message : STUDENT_MESSAGES.courseChangeError);
      },
      complete: () => this.savingId.set(null),
    });
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
}
