import { Injectable } from '@angular/core';
import type { EditableTeacher } from './teacher-editor.model';

const TEACHER_EDITOR_CACHE_KEY = 'educontrol.cache.teacher-details';

@Injectable({ providedIn: 'root' })
export class TeacherEditorCacheRepository {
  findById(teacherId: string): EditableTeacher | null {
    return this.read()[teacherId] ?? null;
  }

  save(teacher: EditableTeacher): void {
    this.write({ ...this.read(), [teacher.id]: teacher });
  }

  remove(teacherId: string): void {
    const cache = this.read();
    delete cache[teacherId];
    this.write(cache);
  }

  private read(): Record<string, EditableTeacher> {
    const rawCache = localStorage.getItem(TEACHER_EDITOR_CACHE_KEY);

    if (!rawCache) {
      return {};
    }

    try {
      return JSON.parse(rawCache) as Record<string, EditableTeacher>;
    } catch {
      this.write({});
      return {};
    }
  }

  private write(cache: Record<string, EditableTeacher>): void {
    localStorage.setItem(TEACHER_EDITOR_CACHE_KEY, JSON.stringify(cache));
  }
}
