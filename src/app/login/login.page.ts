import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonNote, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline, personOutline } from 'ionicons/icons';
import { finalize } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import { FieldErrorComponent } from '../shared/components/field-error/field-error.component';
import { FormCheckboxComponent } from '../shared/components/form-checkbox/form-checkbox.component';
import { FormInputComponent } from '../shared/components/form-input/form-input.component';
import { BrandLockupComponent } from './components/brand-lockup/brand-lockup.component';
import { LoginDeviceFrameComponent } from './components/login-device-frame/login-device-frame.component';
import { RememberedUserService } from './services/remembered-user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonButton,
    IonContent,
    IonNote,
    IonSpinner,
    FieldErrorComponent,
    FormCheckboxComponent,
    FormInputComponent,
    BrandLockupComponent,
    LoginDeviceFrameComponent,
  ],
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly rememberedUserService = inject(RememberedUserService);
  private readonly router = inject(Router);

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: [this.rememberedUserService.get(), [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberUser: [Boolean(this.rememberedUserService.get())],
  });

  readonly crestSrc = 'assets/escudo_bandera.png';
  isSubmitting = false;
  errorMessage = '';

  constructor() {
    addIcons({ lockClosedOutline, personOutline });
  }

  submit(): void {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    const { email, password } = this.loginForm.getRawValue();
    this.authService
      .signIn(email, password)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.persistRememberedUser();
          this.router.navigateByUrl('/home', { replaceUrl: true });
        },
        error: (error: Error) => (this.errorMessage = error.message),
      });
  }

  private persistRememberedUser(): void {
    const { email, rememberUser } = this.loginForm.getRawValue();

    if (rememberUser) {
      this.rememberedUserService.save(email);
      return;
    }

    this.rememberedUserService.clear();
  }
}
