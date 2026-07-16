import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonDatetime, IonIcon, IonInput, IonModal, IonSelect, IonSelectOption, IonTextarea } from '@ionic/angular/standalone';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';
import { ACADEMIC_COURSES, getAcademicSubjectsByCourse } from '../core/academic/academic-course.catalog';
import { APP_ROUTES } from '../core/constants/app-routes.constants';
import { STUDENT_MESSAGES } from '../core/constants/ui-messages.constants';
import { AutoDismissSignal } from '../core/utils/auto-dismiss-signal.util';
import { NetworkStatusComponent } from '../detector_red/network-status.component';
import { StudentOfflineSyncService } from '../modo_offline/student-offline-sync.service';
import { StudentFormSectionComponent } from './components/student-form-section/student-form-section.component';
import { StudentPhotoPickerComponent } from './components/student-photo-picker/student-photo-picker.component';
import { StudentWifiShareComponent } from './components/student-wifi-share/student-wifi-share.component';
import { StudentRegistrationDraftFactory } from './services/student-registration-draft.factory';
import { extractBirthDateValue, formatBirthDateLabel } from './utils/student-birth-date.util';
import { registerStudentRegistrationIcons } from './utils/student-registration-icons.util';

@Component({
  selector: 'app-student-registration',
  templateUrl: './student-registration.page.html',
  styleUrls: ['./student-registration.page.scss'],
  imports: [
    AppBottomNavigationComponent,
    AppPageHeaderComponent,
    IonButton,
    IonContent,
    IonDatetime,
    IonIcon,
    IonInput,
    IonModal,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    NetworkStatusComponent,
    ReactiveFormsModule,
    StudentFormSectionComponent,
    StudentPhotoPickerComponent,
    StudentWifiShareComponent,
  ],
})
export class StudentRegistrationPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly offlineSyncService = inject(StudentOfflineSyncService);
  private readonly draftFactory = inject(StudentRegistrationDraftFactory);
  private readonly saveNotification = new AutoDismissSignal<string | null>((message) => this.saveMessage.set(message), null);

  photoPreviewUrl: string | null = null;
  selectedPhoto: File | null = null;
  readonly birthDatePickerOpen = signal(false);
  readonly saveMessage = signal<string | null>(null);
  readonly saving = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    birthDate: ['', Validators.required],
    nationality: ['', Validators.required],
    gender: ['', Validators.required],
    course: ['', Validators.required],
    motherName: ['', Validators.required],
    motherId: ['', Validators.required],
    fatherName: ['', Validators.required],
    fatherId: ['', Validators.required],
    address: ['', Validators.required],
    contactPhone: ['', Validators.required],
  });

  readonly nationalities = ['Dominicana', 'Haitiana', 'Venezolana', 'Colombiana', 'Otra'];
  readonly genders = ['Masculino', 'Femenino'];
  readonly courses = ACADEMIC_COURSES;
  selectedSubjects(): string[] {
    return getAcademicSubjectsByCourse(this.form.controls.course.value);
  }

  constructor() {
    registerStudentRegistrationIcons();
    this.destroyRef.onDestroy(() => {
      this.saveNotification.dispose();
      this.revokePhotoPreviewUrl();
    });
  }

  onPhotoSelected(file: File): void {
    this.revokePhotoPreviewUrl();
    this.selectedPhoto = file;
    this.photoPreviewUrl = URL.createObjectURL(file);
  }

  private revokePhotoPreviewUrl(): void {
    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
      this.photoPreviewUrl = null;
    }
  }

  openBirthDatePicker(): void {
    this.birthDatePickerOpen.set(true);
  }

  closeBirthDatePicker(): void {
    this.birthDatePickerOpen.set(false);
  }

  updateBirthDate(event: CustomEvent<{ value?: string | string[] | null }>): void {
    const selectedDate = extractBirthDateValue(event.detail.value);

    if (selectedDate) {
      this.form.controls.birthDate.setValue(selectedDate);
      this.form.controls.birthDate.markAsTouched();
    }

    this.closeBirthDatePicker();
  }

  birthDateLabel(): string {
    return formatBirthDateLabel(this.form.controls.birthDate.value);
  }

  cancel(): void {
    this.router.navigateByUrl(APP_ROUTES.home);
  }

  registerStudent(): void {
    this.form.markAllAsTouched();
    this.saveNotification.clear();

    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);

    this.offlineSyncService.register(this.draftFactory.create(this.form.getRawValue())).subscribe({
      next: () => {
        this.saveNotification.show(STUDENT_MESSAGES.registerSuccess);
        this.form.reset();
        this.selectedPhoto = null;
        this.revokePhotoPreviewUrl();
      },
      error: () => {
        this.saveNotification.show(STUDENT_MESSAGES.registerError);
      },
      complete: () => this.saving.set(false),
    });
  }

  isInvalid(controlName: keyof typeof this.form.controls): boolean {
    return this.form.controls[controlName].invalid && (this.form.controls[controlName].touched || this.form.controls[controlName].dirty);
  }
}
