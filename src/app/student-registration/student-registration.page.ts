import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonDatetime, IonIcon, IonInput, IonModal, IonSelect, IonSelectOption, IonTextarea } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  callOutline,
  cardOutline,
  earthOutline,
  homeOutline,
  peopleOutline,
  personOutline,
  schoolOutline,
  maleFemaleOutline,
} from 'ionicons/icons';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';
import { NetworkStatusComponent } from '../detector_red/network-status.component';
import { StudentOfflineSyncService } from '../modo_offline/student-offline-sync.service';
import type { StudentRegistrationDraft } from '../modo_offline/student-registration.model';
import { StudentFormSectionComponent } from './components/student-form-section/student-form-section.component';
import { StudentPhotoPickerComponent } from './components/student-photo-picker/student-photo-picker.component';

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
  ],
})
export class StudentRegistrationPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly offlineSyncService = inject(StudentOfflineSyncService);

  photoPreviewUrl: string | null = null;
  selectedPhoto: File | null = null;
  readonly birthDatePickerOpen = signal(false);
  readonly saveMessage = signal<string | null>(null);
  readonly saving = signal(false);
  readonly pendingCount$ = this.offlineSyncService.pendingCount$;

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
  readonly courses = ['Inicial', 'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto'];

  constructor() {
    addIcons({
      calendarOutline,
      callOutline,
      cardOutline,
      earthOutline,
      homeOutline,
      maleFemaleOutline,
      peopleOutline,
      personOutline,
      schoolOutline,
    });

    this.destroyRef.onDestroy(() => this.revokePhotoPreviewUrl());
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
    const value = event.detail.value;
    const selectedDate = Array.isArray(value) ? value[0] : value;

    if (selectedDate) {
      this.form.controls.birthDate.setValue(selectedDate.slice(0, 10));
      this.form.controls.birthDate.markAsTouched();
    }

    this.closeBirthDatePicker();
  }

  birthDateLabel(): string {
    const value = this.form.controls.birthDate.value;

    if (!value) {
      return 'Seleccione fecha';
    }

    const [year, month, day] = value.slice(0, 10).split('-');

    return day && month && year ? `${day}/${month}/${year}` : value;
  }

  cancel(): void {
    this.router.navigateByUrl('/home');
  }

  registerStudent(): void {
    this.form.markAllAsTouched();
    this.saveMessage.set(null);

    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);

    this.offlineSyncService.register(this.toStudentDraft()).subscribe({
      next: (result) => {
        const pendingMessage = result.pendingCount > 0 ? ` Pendientes por sincronizar: ${result.pendingCount}.` : '';
        const message = this.getSaveMessage(result.mode, result.reason, pendingMessage);

        this.saveMessage.set(message);
        this.form.reset();
        this.selectedPhoto = null;
        this.revokePhotoPreviewUrl();
      },
      error: () => {
        this.saveMessage.set('No se pudo registrar el estudiante. Intenta nuevamente.');
      },
      complete: () => this.saving.set(false),
    });
  }

  private getSaveMessage(mode: 'online' | 'offline' | 'queued', reason: 'auth-missing' | 'remote-error' | undefined, pendingMessage: string): string {
    if (mode === 'online') {
      return `Estudiante registrado en Firebase.${pendingMessage}`;
    }

    if (mode === 'offline') {
      return `Sin conexion: el estudiante fue guardado localmente.${pendingMessage}`;
    }

    if (reason === 'auth-missing') {
      return `No hay sesion activa para enviar a Firebase. El estudiante fue guardado localmente.${pendingMessage}`;
    }

    return `Firebase rechazo el registro. El estudiante fue guardado localmente para sincronizarlo cuando se corrija el problema.${pendingMessage}`;
  }

  isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];

    return control.invalid && (control.touched || control.dirty);
  }

  private toStudentDraft(): StudentRegistrationDraft {
    const value = this.form.getRawValue();
    const now = new Date().toISOString();

    return {
      nombres: value.firstName.trim(),
      apellidos: value.lastName.trim(),
      fechaNacimiento: value.birthDate,
      nacionalidad: value.nationality,
      genero: value.gender,
      curso: value.course,
      nombreMadre: value.motherName.trim(),
      cedulaMadre: value.motherId.trim(),
      nombrePadre: value.fatherName.trim(),
      cedulaPadre: value.fatherId.trim(),
      direccion: value.address.trim(),
      telefonoContacto: value.contactPhone.trim(),
      fotoUrl: '',
      estado: 'activo',
      createdAt: now,
      updatedAt: now,
    };
  }
}
