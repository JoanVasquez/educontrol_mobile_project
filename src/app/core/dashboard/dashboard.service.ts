import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { AttendanceCacheRepository } from '../attendance/attendance-cache.repository';
import { AttendanceDateUtil } from '../attendance/attendance-date.util';
import type { AttendanceSheet, AttendanceStudent } from '../attendance/attendance.model';
import { AttendanceRepository } from '../attendance/attendance.repository';
import { PendingAttendanceRepository } from '../attendance/pending-attendance.repository';
import { ValidAuthSessionService } from '../auth/valid-auth-session.service';
import { PendingBreakdownRepository } from '../breakdowns/offline/pending-breakdown.repository';
import { BreakdownService } from '../firebase/breakdown.service';
import type { Breakdown } from '../models/breakdown.model';
import { TeacherCacheRepository } from '../teachers/teacher-cache.repository';
import { TeacherQueryRepository } from '../teachers/teacher-query.repository';
import { DashboardCacheRepository } from './dashboard-cache.repository';
import type { DashboardData, DashboardSnapshot } from './dashboard.model';
import { DashboardPresenter } from './dashboard.presenter';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly attendanceRepository = inject(AttendanceRepository);
  private readonly attendanceCache = inject(AttendanceCacheRepository);
  private readonly authSession = inject(ValidAuthSessionService);
  private readonly breakdownRepository = inject(BreakdownService);
  private readonly dashboardCache = inject(DashboardCacheRepository);
  private readonly pendingAttendance = inject(PendingAttendanceRepository);
  private readonly pendingBreakdowns = inject(PendingBreakdownRepository);
  private readonly presenter = inject(DashboardPresenter);
  private readonly teacherCache = inject(TeacherCacheRepository);
  private readonly teacherRepository = inject(TeacherQueryRepository);

  load(): Observable<DashboardData> {
    return this.authSession.get().pipe(
      switchMap((session) => {
        if (!session) {
          return of(this.loadFromCache());
        }

        return this.loadFromRemote(session.idToken).pipe(catchError(() => of(this.loadFromCache())));
      }),
    );
  }

  private loadFromRemote(idToken: string): Observable<DashboardData> {
    return this.attendanceRepository.findStudents(idToken).pipe(
      catchError(() => of(this.attendanceCache.getStudents())),
      switchMap((students) =>
        forkJoin({
          students: of(students),
          sheets: this.findDashboardSheets(students, idToken),
          teachers: this.teacherRepository.findAll(idToken).pipe(catchError(() => of(this.teacherCache.getAll()))),
          breakdowns: this.breakdownRepository.getAllBreakdowns().pipe(catchError(() => of([]))),
        }),
      ),
      tap(({ students, sheets, teachers }) => {
        this.attendanceCache.saveStudents(students);
        sheets.forEach((sheet) => this.attendanceCache.saveSheet(sheet));
        this.teacherCache.replaceAll(teachers);
      }),
      map(({ students, sheets, teachers, breakdowns }) =>
        this.presenter.present(
          {
            students,
            sheets: this.mergePendingSheets(sheets),
            teachers,
            breakdowns: this.mergePendingBreakdowns(breakdowns),
            today: AttendanceDateUtil.today(),
          },
          'remote',
        ),
      ),
      tap((dashboard) => this.dashboardCache.save(dashboard)),
    );
  }

  private findDashboardSheets(students: AttendanceStudent[], idToken: string): Observable<AttendanceSheet[]> {
    return this.attendanceRepository
      .findSheets(idToken)
      .pipe(catchError(() => this.findRecentSheetsByCourse(students, idToken)));
  }

  private findRecentSheetsByCourse(students: AttendanceStudent[], idToken: string): Observable<AttendanceSheet[]> {
    const courses = [...new Set(students.map((student) => student.course).filter(Boolean))];
    const documentIds = courses.reduce<string[]>(
      (ids, course) => [
        ...ids,
        ...this.lastDays(AttendanceDateUtil.today(), 6).map((date) => AttendanceDateUtil.documentId(course, date)),
      ],
      [],
    );

    if (!documentIds.length) {
      return of(this.attendanceCache.getSheets());
    }

    const requests: Observable<AttendanceSheet | null>[] = documentIds.map((documentId) =>
      this.attendanceRepository.findSheet(documentId, idToken).pipe(catchError(() => of(null))),
    );

    return forkJoin(requests).pipe(
      map((sheets) => {
        const remoteSheets = sheets.filter((sheet): sheet is AttendanceSheet => Boolean(sheet));
        return remoteSheets.length ? remoteSheets : this.attendanceCache.getSheets();
      }),
    );
  }

  private loadFromCache(): DashboardData {
    const cachedDashboard = this.dashboardCache.get();
    const snapshot = this.cachedSnapshot();
    const hasDomainCache =
      snapshot.students.length || snapshot.sheets.length || snapshot.teachers.length || snapshot.breakdowns.length;

    if (!hasDomainCache) {
      if (cachedDashboard) {
        return { ...cachedDashboard, source: 'cache' };
      }
    }

    const dashboard = this.presenter.present(snapshot, 'cache');
    const cachedAwareDashboard = {
      ...dashboard,
      pendingBreakdowns: Math.max(dashboard.pendingBreakdowns, cachedDashboard?.pendingBreakdowns ?? 0),
    };

    this.dashboardCache.save(cachedAwareDashboard);
    return cachedAwareDashboard;
  }

  private cachedSnapshot(): DashboardSnapshot {
    return {
      students: this.attendanceCache.getStudents(),
      sheets: this.mergePendingSheets(this.attendanceCache.getSheets()),
      teachers: this.teacherCache.getAll(),
      breakdowns: this.mergePendingBreakdowns([]),
      today: AttendanceDateUtil.today(),
    };
  }

  private mergePendingSheets(sheets: AttendanceSheet[]): AttendanceSheet[] {
    const byId = new Map(sheets.map((sheet) => [sheet.id, sheet]));
    this.pendingAttendance.getAll().forEach((pending) => byId.set(pending.sheet.id, pending.sheet));
    return [...byId.values()];
  }

  private mergePendingBreakdowns(breakdowns: Breakdown[]): Breakdown[] {
    const byId = new Map(breakdowns.map((breakdown) => [breakdown.id ?? crypto.randomUUID(), breakdown]));
    this.pendingBreakdowns.getAll().forEach((pending) =>
      byId.set(pending.documentId, {
        ...pending.payload,
        id: pending.documentId,
      }),
    );
    return [...byId.values()];
  }

  private lastDays(today: string, amount: number): string[] {
    const [year, month, day] = today.split('-').map(Number);
    const baseDate = new Date(year, month - 1, day);

    return Array.from({ length: amount }, (_, index) => {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() - (amount - 1 - index));
      return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-');
    });
  }
}
