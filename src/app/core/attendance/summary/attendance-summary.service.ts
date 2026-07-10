import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import { AttendanceService } from '../attendance.service';
import type { AttendanceSummaryResult } from './attendance-summary.model';
import { AttendanceSummaryPresenter } from './attendance-summary.presenter';

@Injectable({ providedIn: 'root' })
export class AttendanceSummaryService {
  private readonly attendanceService = inject(AttendanceService);
  private readonly presenter = new AttendanceSummaryPresenter();

  load(course: string, date: string): Observable<AttendanceSummaryResult> {
    return this.attendanceService.load(course, date).pipe(map((roster) => this.presenter.present(roster)));
  }

  percentage(value: number, total: number): string {
    return this.presenter.percentage(value, total);
  }

  statusLabel(status: AttendanceSummaryResult['students'][number]['status']): string {
    return this.presenter.statusLabel(status);
  }
}
