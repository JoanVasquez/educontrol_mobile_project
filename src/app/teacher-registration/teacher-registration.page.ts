import type { OnDestroy } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { ACADEMIC_COURSES } from '../core/academic/academic-course.catalog';
import type { TeacherAssignment, TeacherCourseAssignment } from '../core/teachers/teacher-registration.model';
import { TeacherRegistrationService } from '../core/teachers/teacher-registration.service';
import { AutoDismissSignal } from '../core/utils/auto-dismiss-signal.util';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';
import { TeacherRegistrationCommandFactory, type TeacherRegistrationFormValue } from './services/teacher-registration-command.factory';
import { TeacherRegistrationMessagePresenter } from './services/teacher-registration-message.presenter';
import { TeacherRegistrationPhotoService } from './services/teacher-registration-photo.service';
import { TeacherRegistrationFormValidator } from './utils/teacher-registration-form.validator';
import { registerTeacherRegistrationIcons } from './utils/teacher-registration-icons.util';

@Component({
  selector: 'app-teacher-registration',
  templateUrl: './teacher-registration.page.html',
  styleUrls: ['./teacher-registration.page.scss'],
  imports: [AppBottomNavigationComponent, AppPageHeaderComponent, FormsModule, IonContent, IonIcon],
})
export class TeacherRegistrationPage implements OnDestroy {
  private readonly registrationService = inject(TeacherRegistrationService);
  private readonly commandFactory = inject(TeacherRegistrationCommandFactory);
  private readonly messagePresenter = inject(TeacherRegistrationMessagePresenter);
  private readonly photoService = inject(TeacherRegistrationPhotoService);
  private readonly notification = new AutoDismissSignal<string>((message) => this.message.set(message), '');

  readonly photoName = this.photoService.photoName;
  readonly photoPreviewUrl = this.photoService.photoPreviewUrl;
  readonly message = signal('');
  readonly saving = signal(false);

  firstName = '';
  lastName = '';
  email = '';
  accessCode = '';
  institution = '';
  district = '';
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
  readonly courses = ACADEMIC_COURSES;

  constructor() {
    registerTeacherRegistrationIcons();
  }

  ngOnDestroy(): void {
    this.notification.dispose();
    this.photoService.revokeObjectUrl();
  }

  async takePhoto(): Promise<void> {
    if (!this.saving()) await this.photoService.takePhoto((message) => this.showMessage(message));
  }

  async pickPhotoFromGallery(): Promise<void> {
    if (!this.saving()) await this.photoService.pickPhotoFromGallery((message) => this.showMessage(message));
  }

  selectPhoto(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    const input = event.target as HTMLInputElement;

    if (!file) {
      return;
    }

    if (this.photoService.setPhoto(file, (message) => this.showMessage(message))) this.notification.clear();
    input.value = '';
  }

  addAssignment(): void { this.assignments = [...this.assignments, { subject: '', detail: '' }]; }

  addCourse(): void { this.courseAssignments = [...this.courseAssignments, { course: '', section: '' }]; }

  cancel(): void {
    this.reset();
    this.notification.clear();
  }

  async submit(): Promise<void> {
    const value = this.formValue();
    const requiredMessage = TeacherRegistrationFormValidator.requiredMessage(value);

    if (requiredMessage) {
      this.showMessage(requiredMessage);
      return;
    }

    if (!TeacherRegistrationFormValidator.isValidEmail(this.email)) {
      this.showMessage('Ingresa un correo válido para el acceso del docente.');
      return;
    }

    if (this.saving()) {
      return;
    }

    this.saving.set(true);
    this.notification.clear();

    try {
      const command = this.commandFactory.create(value, this.assignments, this.courseAssignments, await this.photoService.serializedPhoto());
      const result = await firstValueFrom(this.registrationService.register(command));
      this.reset();
      this.showMessage(this.messagePresenter.resultMessage(result));
    } catch {
      this.showMessage('No se pudo preparar el registro del docente. Intenta nuevamente.');
    } finally {
      this.saving.set(false);
    }
  }

  private formValue(): TeacherRegistrationFormValue {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      accessCode: this.accessCode,
      institution: this.institution,
      district: this.district,
      birthDate: this.birthDate,
      nationality: this.nationality,
      gender: this.gender,
      idNumber: this.idNumber,
      address: this.address,
      phone: this.phone,
    };
  }

  private reset(): void {
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.accessCode = '';
    this.institution = '';
    this.district = '';
    this.birthDate = '';
    this.nationality = '';
    this.gender = '';
    this.idNumber = '';
    this.address = '';
    this.phone = '';
    this.assignments = [{ subject: '', detail: '' }];
    this.courseAssignments = [{ course: '', section: '' }];
    this.photoService.reset();
  }

  private showMessage(message: string): void {
    this.notification.show(message);
  }

}
