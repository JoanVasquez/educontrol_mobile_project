import type { AttendanceRoster, AttendanceStatus } from '../attendance.model';
import type { AttendanceMetrics, AttendanceSummaryResult } from './attendance-summary.model';

export class AttendanceSummaryPresenter {
  present(roster: AttendanceRoster): AttendanceSummaryResult {
    return {
      courses: roster.courses,
      students: roster.students.map((student) => ({
        id: student.id,
        fullName: student.fullName,
        photoUrl: student.photoUrl,
        status: student.status,
      })),
      metrics: this.metrics(roster.students.map((student) => student.status)),
      source: roster.source,
    };
  }

  percentage(value: number, total: number): string {
    if (!total) return '0%';

    const percentage = (value / total) * 100;
    return `${Number.isInteger(percentage) ? percentage : percentage.toFixed(1)}%`;
  }

  statusLabel(status: AttendanceStatus | null): string {
    if (status === 'present') return 'Presente';
    if (status === 'absent') return 'Ausente';
    if (status === 'excused') return 'Excusa';
    return 'Sin registrar';
  }

  private metrics(statuses: Array<AttendanceStatus | null>): AttendanceMetrics {
    return statuses.reduce<AttendanceMetrics>(
      (summary, status) => {
        if (status === 'present') summary.present++;
        else if (status === 'absent') summary.absent++;
        else if (status === 'excused') summary.excused++;
        else summary.unmarked++;
        return summary;
      },
      { total: statuses.length, present: 0, absent: 0, excused: 0, unmarked: 0 },
    );
  }
}
