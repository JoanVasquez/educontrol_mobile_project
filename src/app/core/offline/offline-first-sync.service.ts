import { Injectable, inject } from '@angular/core';
import { EMPTY, catchError, from, switchMap } from 'rxjs';
import { NetworkService } from '../../detector_red/network.service';
import { AttendanceOfflineSyncService } from '../attendance/attendance-offline-sync.service';
import { BreakdownOfflineSyncService } from '../breakdowns/offline/breakdown-offline-sync.service';
import { StudentAcademicService } from '../students/student-academic.service';
import { TeacherRegistrationService } from '../teachers/teacher-registration.service';
import { StudentOfflineSyncService } from '../../modo_offline/student-offline-sync.service';

@Injectable({ providedIn: 'root' })
export class OfflineFirstSyncService {
  private readonly attendanceSync = inject(AttendanceOfflineSyncService);
  private readonly breakdownSync = inject(BreakdownOfflineSyncService);
  private readonly network = inject(NetworkService);
  private readonly studentRegistrationSync = inject(StudentOfflineSyncService);
  private readonly studentAcademicSync = inject(StudentAcademicService);
  private readonly teacherRegistrationSync = inject(TeacherRegistrationService);

  private started = false;
  private syncing = false;

  start(): void {
    if (this.started) {
      return;
    }

    this.started = true;
    this.network.isOnline$
      .pipe(
        switchMap((isOnline) => (isOnline ? from(this.syncAll()) : EMPTY)),
        catchError(() => EMPTY),
      )
      .subscribe();

    if (this.network.isOnline) {
      void this.syncAll();
    }
  }

  async syncAll(): Promise<void> {
    if (this.syncing || !this.network.isOnline) {
      return;
    }

    this.syncing = true;

    try {
      await Promise.all([
        this.runSyncTask(() => this.studentRegistrationSync.syncPending()),
        this.runSyncTask(() => this.studentAcademicSync.syncPending()),
        this.runSyncTask(() => this.teacherRegistrationSync.syncPending()),
        this.runSyncTask(() => this.attendanceSync.syncPending()),
        this.runSyncTask(() => this.breakdownSync.syncPending()),
      ]);
    } finally {
      this.syncing = false;
    }
  }

  private async runSyncTask(task: () => Promise<unknown>): Promise<void> {
    try {
      await task();
    } catch (error) {
      console.error('No se pudo completar una tarea de sincronizacion offline-first:', error);
    }
  }
}
