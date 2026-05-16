import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['signIn']);

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    fixture.detectChanges();
  });

  it('should not submit invalid credentials', () => {
    component.submit();

    expect(authService.signIn).not.toHaveBeenCalled();
    expect(component.loginForm.touched).toBeTrue();
  });

  it('should navigate home after a successful login', () => {
    authService.signIn.and.returnValue(of({
      uid: 'firebase-auth-uid',
      email: 'admin@example.com',
      fullName: 'Usuario IT',
      role: 'admin',
      status: 'active',
    }));
    component.loginForm.setValue({ email: 'admin@example.com', password: 'valid-password' });

    component.submit();

    expect(authService.signIn).toHaveBeenCalledOnceWith('admin@example.com', 'valid-password');
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/home', { replaceUrl: true });
  });

  it('should display authentication errors', () => {
    authService.signIn.and.returnValue(throwError(() => new Error('Credenciales inválidas.')));
    component.loginForm.setValue({ email: 'admin@example.com', password: 'valid-password' });

    component.submit();

    expect(component.errorMessage).toBe('Credenciales inválidas.');
  });
});
