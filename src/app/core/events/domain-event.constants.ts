export const DOMAIN_EVENTS = {
  attendanceChanged: 'attendance.changed',
  breakdownChanged: 'breakdown.changed',
  studentChanged: 'student.changed',
  teacherChanged: 'teacher.changed',
} as const;

export type DomainEventName = (typeof DOMAIN_EVENTS)[keyof typeof DOMAIN_EVENTS];
