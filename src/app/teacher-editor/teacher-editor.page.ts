import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, person } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { ACADEMIC_COURSES } from '../core/academic/academic-course.catalog';
import type { EditableTeacher } from '../core/teachers/editor/teacher-editor.model';
import { TeacherEditorService } from '../core/teachers/editor/teacher-editor.service';
import type { TeacherAssignment, TeacherCourseAssignment } from '../core/teachers/teacher-registration.model';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';
import { TeacherEditorPhotoService } from './services/teacher-editor-photo.service';
import { createEditableTeacher, isTeacherEditorValid, normalizeEditableTeacher } from './utils/teacher-editor-form.util';

@Component({
  selector: 'app-teacher-editor',
  templateUrl: './teacher-editor.page.html',
  styleUrls: ['./teacher-editor.page.scss'],
  imports: [AppBottomNavigationComponent, AppPageHeaderComponent, FormsModule, IonContent, IonIcon],
  providers: [TeacherEditorPhotoService],
})
export class TeacherEditorPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly editorService = inject(TeacherEditorService);
  private readonly photoService = inject(TeacherEditorPhotoService);

  teacher: EditableTeacher | null = null;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly message = signal('');
  readonly errorMessage = signal('');
  readonly showingCache = signal(false);
  readonly photoPreviewUrl = this.photoService.photoPreviewUrl;

  readonly nationalities = ['Dominicana', 'Haitiana', 'Venezolana', 'Colombiana', 'Otra'];
  readonly genders = ['Masculino', 'Femenino'];
  readonly subjects = ['Matemáticas', 'Lengua Española', 'Ciencias Sociales', 'Ciencias Naturales', 'Inglés'];
  readonly courses = ACADEMIC_COURSES;

  constructor() {
    addIcons({ cameraOutline, person });
    void this.load();
  }

  async load(): Promise<void> {
    const teacherId = this.route.snapshot.paramMap.get('id');
    this.loading.set(true);
    this.errorMessage.set('');

    if (!teacherId) {
      this.loading.set(false);
      this.errorMessage.set('No se recibió el identificador del docente.');
      return;
    }

    try {
      const result = await firstValueFrom(this.editorService.load(teacherId));
      this.teacher = createEditableTeacher(result.teacher);
      this.photoService.setRemotePreview(this.teacher.photoUrl);
      this.showingCache.set(result.source === 'cache');
    } catch (error: unknown) {
      this.errorMessage.set(error instanceof Error ? error.message : 'No se pudo cargar el docente.');
    } finally {
      this.loading.set(false);
    }
  }

  selectPhoto(event: Event): void {
    this.photoService.select(event, (message) => this.message.set(message));
  }

  addAssignment(): void {
    this.teacher?.assignments.push({ subject: '', detail: '' });
  }

  removeAssignment(index: number): void {
    if (!this.teacher || this.teacher.assignments.length === 1) {
      return;
    }

    this.teacher.assignments.splice(index, 1);
  }

  addCourse(): void {
    this.teacher?.courses.push({ course: '', section: '' });
  }

  removeCourse(index: number): void {
    if (!this.teacher || this.teacher.courses.length === 1) {
      return;
    }

    this.teacher.courses.splice(index, 1);
  }

  cancel(): void {
    void this.router.navigateByUrl('/docentes/listado');
  }

  async update(): Promise<void> {
    if (!this.teacher || this.saving() || this.deleting()) {
      return;
    }

    if (!isTeacherEditorValid(this.teacher)) {
      this.message.set('Completa todos los campos obligatorios.');
      return;
    }

    this.saving.set(true);
    this.message.set('');

    try {
      const photo = await this.photoService.serializedPhoto();
      const updatedTeacher = await firstValueFrom(
        this.editorService.update(normalizeEditableTeacher(this.teacher), photo),
      );
      this.teacher = updatedTeacher;
      this.photoService.clearSelectedPhoto();
      this.showingCache.set(false);
      this.message.set('Docente actualizado correctamente.');
    } catch {
      this.message.set('No se pudo actualizar el docente. Verifica tu conexión, sesión y permisos.');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteTeacher(): Promise<void> {
    if (!this.teacher || this.saving() || this.deleting()) {
      return;
    }

    const fullName = `${this.teacher.firstName} ${this.teacher.lastName}`.trim();
    if (!window.confirm(`¿Deseas eliminar a ${fullName}? Esta acción no se puede deshacer.`)) {
      return;
    }

    this.deleting.set(true);
    this.message.set('');

    try {
      await firstValueFrom(this.editorService.delete(this.teacher));
      await this.router.navigateByUrl('/docentes/listado');
    } catch {
      this.message.set('No se pudo eliminar el docente. Verifica tu conexión, sesión y permisos.');
      this.deleting.set(false);
    }
  }

  trackAssignment(index: number, item: TeacherAssignment): string {
    return `${index}-${item.subject}-${item.detail}`;
  }

  trackCourse(index: number, item: TeacherCourseAssignment): string {
    return `${index}-${item.course}-${item.section}`;
  }

}
