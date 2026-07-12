import type { OnDestroy } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, cameraOutline, imageOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { CameraService } from '../core/camera/camera.service';
import { DEFAULT_TEACHER_PASSWORD } from '../core/teachers/teacher-access.constants';
import type {
  RegisterTeacherResult,
  TeacherAssignment,
  TeacherCourseAssignment,
  TeacherRegistrationCommand,
  TeacherRegistrationDraft,
} from '../core/teachers/teacher-registration.model';
import { TeacherRegistrationService } from '../core/teachers/teacher-registration.service';
import { DataUrlFileSerializer } from '../core/teachers/utils/data-url-file.serializer';
import { isValidFileSize, isValidImageFile } from '../core/utils/validators.util';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';

const TEACHER_PHOTO_MAX_MB = 1.5;

@Component({
  selector: 'app-teacher-registration',
  templateUrl: './teacher-registration.page.html',
  styleUrls: ['./teacher-registration.page.scss'],
  imports: [AppBottomNavigationComponent, AppPageHeaderComponent, FormsModule, IonContent, IonIcon],
})
export class TeacherRegistrationPage implements OnDestroy {
  private readonly registrationService = inject(TeacherRegistrationService);
  private readonly cameraService = inject(CameraService);
  private readonly fileSerializer = new DataUrlFileSerializer();

  readonly photoName = signal('');
  readonly photoPreviewUrl = signal('');
  readonly message = signal('');
  readonly saving = signal(false);
  private selectedPhoto: File | null = null;
  private objectUrl = '';

  firstName = '';
  lastName = '';
  email = '';
  birthDate = '';
  nationality = '';
  gender = '';
  idNumber = '';
  address = '';
  phone = '';
  assignments: TeacherAssignment[] = [{ subject: '', detail: '' }];
  courseAssignments: TeacherCourseAssignment[] = [{ course: '', section: '' }];

  readonly nationalities = ['Dominicana', 'Haitiana', 'Venezolana', 'Colombiana', 'Otra'];
  readonly genders = ['Masculino', 'Femenino'];
  readonly subjects = ['Matemáticas', 'Lengua Española', 'Ciencias Sociales', 'Ciencias Naturales', 'Inglés'];
  readonly courses = ['1ro', '2do', '3ro', '4to', '5to', '6to'];
  readonly defaultPassword = DEFAULT_TEACHER_PASSWORD;

  constructor() {
    addIcons({ calendarOutline, cameraOutline, imageOutline });
  }

  ngOnDestroy(): void {
    this.revokeObjectUrl();
  }

  async takePhoto(): Promise<void> {
    await this.selectPhotoFromSource(() => firstValueFrom(this.cameraService.takePhoto('docente')));
  }

  async pickPhotoFromGallery(): Promise<void> {
    await this.selectPhotoFromSource(() => firstValueFrom(this.cameraService.pickPhotoFromGallery('docente')));
  }

  selectPhoto(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    const input = event.target as HTMLInputElement;

    if (!file) {
      return;
    }

    this.setPhoto(file);
    input.value = '';
  }

  private async selectPhotoFromSource(source: () => Promise<File>): Promise<void> {
    if (this.saving()) {
      return;
    }

    try {
      this.setPhoto(await source());
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'No se pudo seleccionar la foto.';

      if (!message.toLowerCase().includes('cancelada')) {
        this.message.set(message);
      }
    }
  }

  private setPhoto(file: File): void {
    if (!isValidImageFile(file)) {
      this.message.set('Selecciona una imagen JPEG, PNG, WebP o GIF.');
      return;
    }

    if (!isValidFileSize(file, TEACHER_PHOTO_MAX_MB)) {
      this.message.set('La foto debe pesar menos de 1.5 MB.');
      return;
    }

    this.selectedPhoto = file;
    this.photoName.set(file.name);
    this.setPreview(file);
    this.message.set('');
  }

  addAssignment(): void {
    this.assignments = [...this.assignments, { subject: '', detail: '' }];
  }

  addCourse(): void {
    this.courseAssignments = [...this.courseAssignments, { course: '', section: '' }];
  }

  cancel(): void {
    this.reset();
    this.message.set('');
  }

  async submit(): Promise<void> {
    if (
      !this.firstName.trim() ||
      !this.lastName.trim() ||
      !this.email.trim() ||
      !this.birthDate ||
      !this.nationality ||
      !this.gender ||
      !this.idNumber.trim() ||
      !this.address.trim() ||
      !this.phone.trim()
    ) {
      this.message.set('Completa todos los campos obligatorios.');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.message.set('Ingresa un correo válido para el acceso del docente.');
      return;
    }

    if (this.saving()) {
      return;
    }

    this.saving.set(true);
    this.message.set('');

    try {
      const command = await this.toRegistrationCommand();
      const result = await firstValueFrom(this.registrationService.register(command));
      this.reset();
      this.message.set(this.resultMessage(result));
    } catch {
      this.message.set('No se pudo preparar el registro del docente. Intenta nuevamente.');
    } finally {
      this.saving.set(false);
    }
  }

  private async toRegistrationCommand(): Promise<TeacherRegistrationCommand> {
    const now = new Date().toISOString();
    const teacher: TeacherRegistrationDraft = {
      email: this.email.trim().toLowerCase(),
      authUid: '',
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      birthDate: this.birthDate,
      nationality: this.nationality,
      gender: this.gender,
      idNumber: this.idNumber.trim(),
      address: this.address.trim(),
      phone: this.phone.trim(),
      assignments: this.assignments.filter((item) => item.subject),
      courses: this.courseAssignments.filter((item) => item.course),
      photoUrl: '',
      photoPath: '',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    return {
      registrationId: crypto.randomUUID(),
      teacher,
      photo: this.selectedPhoto ? await this.fileSerializer.fromFile(this.selectedPhoto) : null,
    };
  }

  private resultMessage(result: RegisterTeacherResult): string {
    const pending = result.pendingCount > 0 ? ` Pendientes por sincronizar: ${result.pendingCount}.` : '';

    if (result.mode === 'online') {
      return `Docente registrado en Firebase.${pending}`;
    }

    if (result.mode === 'offline') {
      return `Sin conexión: docente guardado localmente.${pending}`;
    }

    if (result.reason === 'auth-missing') {
      return `La sesión no está disponible. Docente guardado para sincronizar.${pending}`;
    }

    if (result.reason === 'permission-denied') {
      return 'Firebase rechazó el registro por permisos. Despliega las reglas de docentes y verifica el rol del usuario.';
    }

    if (result.reason === 'auth-user-exists') {
      return 'Ya existe una cuenta con ese correo. Usa otro correo para el docente.';
    }

    return `Firebase no recibió el registro. Docente guardado para reintentar.${pending}`;
  }

  private reset(): void {
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.birthDate = '';
    this.nationality = '';
    this.gender = '';
    this.idNumber = '';
    this.address = '';
    this.phone = '';
    this.assignments = [{ subject: '', detail: '' }];
    this.courseAssignments = [{ course: '', section: '' }];
    this.selectedPhoto = null;
    this.photoName.set('');
    this.revokeObjectUrl();
    this.photoPreviewUrl.set('');
  }

  private setPreview(file: File): void {
    this.revokeObjectUrl();
    this.objectUrl = URL.createObjectURL(file);
    this.photoPreviewUrl.set(this.objectUrl);
  }

  private revokeObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = '';
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }
}
