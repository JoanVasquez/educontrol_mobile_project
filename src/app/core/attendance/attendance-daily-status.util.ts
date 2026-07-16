import type { AttendanceSheet, AttendanceStatus } from './attendance.model';

export interface DailyAttendanceStatus {
  readonly status: AttendanceStatus;
  readonly updatedAt: string;
}

export class AttendanceDailyStatusUtil {
  static latestByStudent(sheets: AttendanceSheet[]): Map<string, DailyAttendanceStatus> {
    return sheets.reduce<Map<string, DailyAttendanceStatus>>((statuses, sheet) => {
      sheet.records.forEach((record) => {
        const current = statuses.get(record.studentId);

        if (!current || this.isAfter(sheet.updatedAt, current.updatedAt)) {
          statuses.set(record.studentId, {
            status: record.status,
            updatedAt: sheet.updatedAt,
          });
        }
      });

      return statuses;
    }, new Map<string, DailyAttendanceStatus>());
  }

  private static isAfter(value: string, currentValue: string): boolean {
    return new Date(value).getTime() >= new Date(currentValue).getTime();
  }
}
