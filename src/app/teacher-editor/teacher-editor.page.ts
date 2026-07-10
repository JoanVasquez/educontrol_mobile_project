import type { OnDestroy} from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, person } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import type { EditableTeacher } from '../core/teachers/editor/teacher-editor.model';
import { TeacherEditorService } from '../core/teachers/editor/teacher-editor.service';
import type { TeacherAssignment, TeacherCourseAssignment } from '../core/teachers/teacher-registration.model';
import { DataUrlFileSerializer } from '../core/teachers/utils/data-url-file.serializer';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';

@Component({
  selector: 'app-teacher-editor',
  templateUrl: './teacher-editor.page.html',
  styleUrls: ['./teacher-editor.page.scss'],
  imports: [AppBottomNavigationComponent, AppPageHeaderComponent, FormsModule, IonContent, IonIcon],
})
export class TeacherEditorPage implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly editorService = inject(TeacherEditorService);
  private readonly fileSerializer = new DataUrlFileSerializer();
  private previewObjectUrl = '';
  private selectedPhoto: File | null = null;

  teacher: EditableTeacher | null = null;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly message = signal('');
  readonly errorMessage = signal('');
  readonly showingCache = signal(false);
  readonly photoPreviewUrl = signal('');

  readonly nationalities = ['Dominicana', 'Haitiana', 'Venezolana', 'Colombiana', 'Otra'];
  readonly genders = ['Masculino', 'Femenino'];
  readonly subjects = ['Matemáticas', 'Lengua Española', 'Ciencias Sociales', 'Ciencias Naturales', 'Inglés'];
  readonly courses = ['1ro', '2do', '3ro', '4to', '5to', '6to'];

  constructor() {
    addIcons({ cameraOutline, person });
    void this.load();
  }

  ngOnDestroy(): void {
    this.releasePreviewUrl();
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
      this.teacher = {
        ...result.teacher,
        assignments: result.teacher.assignments.length
          ? result.teacher.assignments.map((item) => ({ ...item }))
          : [{ subject: '', detail: '' }],
        courses: result.teacher.courses.length
          ? result.teacher.courses.map((item) => ({ ...item }))
          : [{ course: '', section: '' }],
      };
      this.photoPreviewUrl.set(this.teacher.photoUrl);
      this.showingCache.set(result.source === 'cache');
    } catch (error: unknown) {
      this.errorMessage.set(error instanceof Error ? error.message : 'No se pudo cargar el docente.');
    } finally {
      this.loading.set(false);
    }
  }

  selectPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.message.set('Selecciona un archivo de imagen válido.');
      input.value = '';
      return;
    }

    if (file.size > 1_500_000) {
      this.message.set('La foto debe pesar menos de 1.5 MB.');
      input.value = '';
      return;
    }

    this.releasePreviewUrl();
    this.selectedPhoto = file;
    this.previewObjectUrl = URL.createObjectURL(file);
    this.photoPreviewUrl.set(this.previewObjectUrl);
    this.message.set('');
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

    if (!this.isValid(this.teacher)) {
      this.message.set('Completa todos los campos obligatorios.');
      return;
    }

    this.saving.set(true);
    this.message.set('');

    try {
      const photo = this.selectedPhoto ? await this.fileSerializer.fromFile(this.selectedPhoto) : null;
      const updatedTeacher = await firstValueFrom(
        this.editorService.update(this.normalized(this.teacher), photo),
      );
      this.teacher = updatedTeacher;
      this.selectedPhoto = null;
      this.showingCache.set(false);
      this.message.set('Docente actualizado correctamente en Firebase.');
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

  private isValid(teacher: EditableTeacher): boolean {
    return Boolean(
      teacher.firstName.trim() &&
        teacher.lastName.trim() &&
        teacher.birthDate &&
        teacher.nationality &&
        teacher.gender &&
        teacher.idNumber.trim() &&
        teacher.address.trim() &&
        teacher.phone.trim(),
    );
  }

  private normalized(teacher: EditableTeacher): EditableTeacher {
    return {
      ...teacher,
      firstName: teacher.firstName.trim(),
      lastName: teacher.lastName.trim(),
      idNumber: teacher.idNumber.trim(),
      address: teacher.address.trim(),
      phone: teacher.phone.trim(),
      assignments: teacher.assignments.map((item) => ({
        subject: item.subject.trim(),
        detail: item.detail.trim(),
      })),
      courses: teacher.courses.map((item) => ({
        course: item.course.trim(),
        section: item.section.trim(),
      })),
    };
  }

  private releasePreviewUrl(): void {
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = '';
    }
  }
}
