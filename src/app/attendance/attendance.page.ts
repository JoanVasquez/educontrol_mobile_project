import { Component, computed, inject, signal } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, checkmark, close, person, searchOutline, timeOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { AttendanceDateUtil } from '../core/attendance/attendance-date.util';
import type { AttendanceStatus, AttendanceStudent } from '../core/attendance/attendance.model';
import { AttendanceService } from '../core/attendance/attendance.service';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss', './attendance.firebase-extra.scss'],
  imports: [AppBottomNavigationComponent, AppPageHeaderComponent, IonContent, IonIcon],
})
export class AttendancePage {
  private readonly attendanceService = inject(AttendanceService);

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

  constructor() {
    addIcons({ calendarOutline, checkmark, close, person, searchOutline, timeOutline });
    void this.initialize();
  }

  async setCourse(event: Event): Promise<void> {
    this.selectedCourse.set((event.target as HTMLSelectElement).value);
    this.selectedSubject.set('');
    this.students.set([]);
    await this.loadRoster();
  }

  async setSubject(event: Event): Promise<void> {
    this.selectedSubject.set((event.target as HTMLSelectElement).value);
    await this.loadRoster();
  }

  async setDate(event: Event): Promise<void> {
    this.selectedDate.set((event.target as HTMLInputElement).value);
    await this.loadRoster();
  }

  setSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  setStatus(studentId: string, status: AttendanceStatus): void {
    this.students.update((students) =>
      students.map((student) => (student.id === studentId ? { ...student, status } : student)),
    );
    this.message.set('');
  }

  async saveAttendance(): Promise<void> {
    if (this.saving() || !this.selectedCourse() || !this.selectedSubject() || !this.students().length) return;
    this.saving.set(true);
    this.message.set('');

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
      this.message.set(this.saveMessage(result.mode, result.pendingCount, result.reason));
    } catch (error: unknown) {
      this.message.set(error instanceof Error ? error.message : 'No se pudo guardar la asistencia.');
    } finally {
      this.saving.set(false);
    }
  }

  async reload(): Promise<void> {
    if (this.selectedCourse()) await this.loadRoster();
    else await this.initialize();
  }

  private async initialize(): Promise<void> {
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

  private async loadRoster(showLoader = true): Promise<void> {
    if (!this.selectedCourse()) return;
    if (showLoader) this.loading.set(true);
    this.errorMessage.set('');
    this.message.set('');
    const requestedSubject = this.selectedSubject();

    try {
      const roster = await firstValueFrom(
        this.attendanceService.load(this.selectedCourse(), this.selectedDate(), requestedSubject),
      );
      this.courses.set(roster.courses);
      this.subjects.set(roster.subjects);
      if (!requestedSubject || !roster.subjects.includes(requestedSubject)) {
        this.selectedSubject.set(roster.subjects[0] ?? '');

        if (this.selectedSubject()) {
          await this.loadRoster(false);
          return;
        }
      }
      this.students.set(roster.students);
      this.showingCache.set(roster.source === 'cache');
    } catch (error: unknown) {
      this.students.set([]);
      this.errorMessage.set(error instanceof Error ? error.message : 'No se pudo cargar el pase de lista.');
    } finally {
      if (showLoader) this.loading.set(false);
    }
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  private saveMessage(mode: 'online' | 'offline' | 'queued', pendingCount: number, reason?: 'auth-missing' | 'remote-error'): string {
    const pending = pendingCount > 0 ? ` Pendientes por sincronizar: ${pendingCount}.` : '';

    if (mode === 'online') {
      return `Asistencia guardada correctamente en Firebase.${pending}`;
    }

    if (mode === 'offline') {
      return `Sin conexión: asistencia guardada localmente.${pending}`;
    }

    if (reason === 'auth-missing') {
      return `La sesión no está disponible. Asistencia guardada para sincronizar.${pending}`;
    }

    return `Firebase no recibió la asistencia. Guardada para reintentar.${pending}`;
  }
}
