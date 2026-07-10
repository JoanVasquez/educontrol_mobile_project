import { Injectable } from '@angular/core';
import type { Teacher } from './teacher.model';

const TEACHERS_CACHE_KEY = 'educontrol.cache.teachers';

@Injectable({ providedIn: 'root' })
export class TeacherCacheRepository {
  getAll(): Teacher[] {
    const rawTeachers = localStorage.getItem(TEACHERS_CACHE_KEY);
    if (!rawTeachers) return [];

    try {
      return (JSON.parse(rawTeachers) as Teacher[]).map((teacher) => ({
        ...teacher,
        createdAt: teacher.createdAt ? new Date(teacher.createdAt) : undefined,
        updatedAt: teacher.updatedAt ? new Date(teacher.updatedAt) : undefined,
      }));
    } catch {
      this.replaceAll([]);
      return [];
    }
  }

  replaceAll(teachers: Teacher[]): void {
    localStorage.setItem(TEACHERS_CACHE_KEY, JSON.stringify(teachers));
  }

  upsert(teacher: Teacher): void {
    const teachers = this.getAll();
    const index = teachers.findIndex((item) => item.id === teacher.id);
    if (index === -1) {
      this.replaceAll([...teachers, teacher]);
      return;
    }
    teachers[index] = teacher;
    this.replaceAll(teachers);
  }

  remove(teacherId: string): void {
    this.replaceAll(this.getAll().filter((teacher) => teacher.id !== teacherId));
  }
}
