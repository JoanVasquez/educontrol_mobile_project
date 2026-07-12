import { Component, inject } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, checkmark, close, person, searchOutline, timeOutline } from 'ionicons/icons';
import type { AttendanceStatus } from '../core/attendance/attendance.model';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';
import { AttendancePageFacade } from './attendance-page.facade';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss', './attendance.firebase-extra.scss'],
  imports: [AppBottomNavigationComponent, AppPageHeaderComponent, IonContent, IonIcon],
  providers: [AttendancePageFacade],
})
export class AttendancePage {
  private readonly facade = inject(AttendancePageFacade);

  readonly courses = this.facade.courses;
  readonly subjects = this.facade.subjects;
  readonly selectedCourse = this.facade.selectedCourse;
  readonly selectedSubject = this.facade.selectedSubject;
  readonly selectedDate = this.facade.selectedDate;
  readonly searchTerm = this.facade.searchTerm;
  readonly students = this.facade.students;
  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly message = this.facade.message;
  readonly errorMessage = this.facade.errorMessage;
  readonly showingCache = this.facade.showingCache;
  readonly visibleStudents = this.facade.visibleStudents;
  readonly markedCount = this.facade.markedCount;

  constructor() {
    addIcons({ calendarOutline, checkmark, close, person, searchOutline, timeOutline });
    void this.facade.initialize();
  }

  async setCourse(event: Event): Promise<void> {
    this.selectedCourse.set((event.target as HTMLSelectElement).value);
    this.selectedSubject.set('');
    this.students.set([]);
    await this.facade.loadRoster();
  }

  async setSubject(event: Event): Promise<void> {
    this.selectedSubject.set((event.target as HTMLSelectElement).value);
    await this.facade.loadRoster();
  }

  async setDate(event: Event): Promise<void> {
    this.selectedDate.set((event.target as HTMLInputElement).value);
    await this.facade.loadRoster();
  }

  setSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  setStatus(studentId: string, status: AttendanceStatus): void {
    this.facade.setStatus(studentId, status);
  }

  async saveAttendance(): Promise<void> {
    await this.facade.saveAttendance();
  }

  async reload(): Promise<void> {
    if (this.selectedCourse()) await this.facade.loadRoster();
    else await this.facade.initialize();
  }
}
