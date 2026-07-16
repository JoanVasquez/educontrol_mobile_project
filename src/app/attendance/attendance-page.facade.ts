import type { OnDestroy } from '@angular/core';
import { computed, Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AttendanceDateUtil } from '../core/attendance/attendance-date.util';
import type { AttendanceStatus, AttendanceStudent } from '../core/attendance/attendance.model';
import { AttendanceService } from '../core/attendance/attendance.service';
import { ATTENDANCE_MESSAGES } from '../core/constants/ui-messages.constants';
import { AutoDismissSignal } from '../core/utils/auto-dismiss-signal.util';

@Injectable()
export class AttendancePageFacade implements OnDestroy {
  private readonly attendanceService = inject(AttendanceService);
  private readonly notification = new AutoDismissSignal<string>((message) => this.message.set(message), '');

  readonly courses = signal<string[]>([]);
  readonly subjects = signal<string[]>([]);
  readonly selectedCourse = signal('');
  readonly selectedSubject = signal('');
  readonly selectedDate = signal(AttendanceDateUtil.today());
  readonly searchTerm = signal('');
  readonly students = signal<AttendanceStudent[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly message = signal('');
  readonly errorMessage = signal('');
  readonly showingCache = signal(false);

  readonly visibleStudents = computed(() => {
    const query = this.normalize(this.searchTerm());
    return this.students().filter((student) => !query || this.normalize(student.fullName).includes(query));
  });
  readonly markedCount = computed(() => this.students().filter((student) => student.status).length);

  ngOnDestroy(): void {
    this.notification.dispose();
  }

  async initialize(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const roster = await firstValueFrom(this.attendanceService.load('', this.selectedDate()));
      this.courses.set(roster.courses);
      this.subjects.set(roster.subjects);
      this.showingCache.set(roster.source === 'cache');

      if (!roster.courses.length) {
        this.students.set([]);
        this.subjects.set([]);
        this.errorMessage.set('No hay cursos disponibles para tu usuario.');
        return;
      }

      this.selectedCourse.set(roster.courses[0]);
      this.selectedSubject.set(roster.subjects[0] ?? '');
      await this.loadRoster(false);
    } catch (error: unknown) {
      this.errorMessage.set(error instanceof Error ? error.message : 'No se pudo cargar el pase de lista.');
    } finally {
      this.loading.set(false);
    }
  }

  async loadRoster(showLoader = true): Promise<void> {
    if (!this.selectedCourse()) return;
    if (showLoader) this.loading.set(true);
    this.errorMessage.set('');
    this.notification.clear();
    const requestedSubject = this.selectedSubject();

    try {
      const roster = await firstValueFrom(
        this.attendanceService.load(this.selectedCourse(), this.selectedDate(), requestedSubject),
      );
      this.courses.set(roster.courses);
      this.subjects.set(roster.subjects);
      if (await this.reloadWhenSubjectChanges(requestedSubject, roster.subjects)) return;
      this.students.set(roster.students);
      this.showingCache.set(roster.source === 'cache');
    } catch (error: unknown) {
      this.students.set([]);
      this.errorMessage.set(error instanceof Error ? error.message : 'No se pudo cargar el pase de lista.');
    } finally {
      if (showLoader) this.loading.set(false);
    }
  }

  async saveAttendance(): Promise<void> {
    if (this.saving() || !this.selectedCourse() || !this.selectedSubject() || !this.students().length) return;
    this.saving.set(true);
    this.notification.clear();

    try {
      const result = await firstValueFrom(
        this.attendanceService.save(
          this.selectedCourse(),
          this.selectedDate(),
          this.students(),
          this.selectedSubject(),
        ),
      );
      this.showingCache.set(result.mode !== 'online');
      this.notification.show(ATTENDANCE_MESSAGES.saveSuccess);
    } catch (error: unknown) {
      this.notification.show(error instanceof Error ? error.message : ATTENDANCE_MESSAGES.saveError);
    } finally {
      this.saving.set(false);
    }
  }

  setStatus(studentId: string, status: AttendanceStatus): void {
    this.students.update((students) =>
      students.map((student) => (student.id === studentId ? { ...student, status } : student)),
    );
    this.notification.clear();
  }

  private async reloadWhenSubjectChanges(requestedSubject: string, subjects: string[]): Promise<boolean> {
    if (requestedSubject && subjects.includes(requestedSubject)) return false;
    this.selectedSubject.set(subjects[0] ?? '');

    if (!this.selectedSubject()) return false;
    await this.loadRoster(false);
    return true;
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

}
