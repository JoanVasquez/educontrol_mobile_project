import type { OnDestroy } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, checkmark, close, peopleOutline, person, timeOutline } from 'ionicons/icons';
import { Subject, firstValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AttendanceDateUtil } from '../core/attendance/attendance-date.util';
import type { AttendanceStatus } from '../core/attendance/attendance.model';
import type {
  AttendanceMetrics,
  AttendanceSummaryStudent,
} from '../core/attendance/summary/attendance-summary.model';
import { AttendanceSummaryService } from '../core/attendance/summary/attendance-summary.service';
import { DOMAIN_EVENTS } from '../core/events/domain-event.constants';
import { DomainEventBusService } from '../core/events/domain-event-bus.service';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';

const EMPTY_METRICS: AttendanceMetrics = {
  total: 0,
  present: 0,
  absent: 0,
  excused: 0,
  unmarked: 0,
};

@Component({
  selector: 'app-attendance-summary',
  templateUrl: './attendance-summary.page.html',
  styleUrls: ['./attendance-summary.page.scss', './attendance-summary.firebase-extra.scss'],
  imports: [AppBottomNavigationComponent, AppPageHeaderComponent, IonContent, IonIcon],
})
export class AttendanceSummaryPage implements OnDestroy {
  private readonly summaryService = inject(AttendanceSummaryService);
  private readonly events = inject(DomainEventBusService);
  private readonly destroy$ = new Subject<void>();

  readonly courses = signal<string[]>([]);
  readonly selectedCourse = signal('');
  readonly selectedDate = signal(AttendanceDateUtil.today());
  readonly students = signal<AttendanceSummaryStudent[]>([]);
  readonly metrics = signal<AttendanceMetrics>(EMPTY_METRICS);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly showingCache = signal(false);

  constructor() {
    addIcons({ calendarOutline, checkmark, close, peopleOutline, person, timeOutline });
    this.events.on(DOMAIN_EVENTS.attendanceChanged).pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.selectedCourse()) void this.loadSummary(false);
      else void this.initialize(false);
    });
    void this.initialize();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async setCourse(event: Event): Promise<void> {
    this.selectedCourse.set((event.target as HTMLSelectElement).value);
    await this.loadSummary();
  }

  async setDate(event: Event): Promise<void> {
    this.selectedDate.set((event.target as HTMLInputElement).value);
    await this.loadSummary();
  }

  percentage(value: number): string {
    return this.summaryService.percentage(value, this.metrics().total);
  }

  statusLabel(status: AttendanceStatus | null): string {
    return this.summaryService.statusLabel(status);
  }

  statusClass(status: AttendanceStatus | null): string {
    return status ?? 'unmarked';
  }

  async reload(): Promise<void> {
    if (this.selectedCourse()) await this.loadSummary();
    else await this.initialize();
  }

  private async initialize(showLoader = true): Promise<void> {
    if (showLoader) this.loading.set(true);
    this.errorMessage.set('');

    try {
      const result = await firstValueFrom(this.summaryService.load('', this.selectedDate()));
      this.courses.set(result.courses);

      if (!result.courses.length) {
        this.errorMessage.set('No hay estudiantes activos con un curso asignado.');
        return;
      }

      this.selectedCourse.set(result.courses[0]);
      await this.loadSummary(false);
    } catch (error: unknown) {
      this.errorMessage.set(error instanceof Error ? error.message : 'No se pudo consultar la asistencia.');
    } finally {
      if (showLoader) this.loading.set(false);
    }
  }

  private async loadSummary(showLoader = true): Promise<void> {
    if (!this.selectedCourse()) return;
    if (showLoader) this.loading.set(true);
    this.errorMessage.set('');

    try {
      const result = await firstValueFrom(
        this.summaryService.load(this.selectedCourse(), this.selectedDate()),
      );
      this.courses.set(result.courses);
      this.students.set(result.students);
      this.metrics.set(result.metrics);
      this.showingCache.set(result.source === 'cache');
    } catch (error: unknown) {
      this.students.set([]);
      this.metrics.set(EMPTY_METRICS);
      this.errorMessage.set(error instanceof Error ? error.message : 'No se pudo consultar la asistencia.');
    } finally {
      if (showLoader) this.loading.set(false);
    }
  }
}
