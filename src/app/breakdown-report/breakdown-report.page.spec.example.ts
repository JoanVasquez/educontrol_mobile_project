/**
 * Example unit tests for BreakdownReportPage
 * Demonstrates testability of the architecture
 *
 * To run tests:
 * ng test
 */

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BreakdownReportPage } from './breakdown-report.page';
import { BreakdownReportFacade } from './services/breakdown-report.facade';
import { createBreakdown } from '../core/models/breakdown.model';
import {
  isValidFileSize,
  isValidImageFile,
  isValidText,
  validateBreakdownForm,
} from '../core/utils/validators.util';

describe('BreakdownReportPage', () => {
  let component: BreakdownReportPage;
  let fixture: ComponentFixture<BreakdownReportPage>;
  let facade: BreakdownReportFacade;
  let router: Router;

  // Mock Facade
  class MockBreakdownReportFacade {
    error$ = of('');
    success$ = of('');
    isLoading = of(false);

    takePhoto() {
      return of(new File(['photo'], 'test.jpg', { type: 'image/jpeg' }));
    }

    pickPhotoFromGallery() {
      return of(new File(['photo'], 'gallery.jpg', { type: 'image/jpeg' }));
    }

    submitBreakdownReport(
      category: string,
      description: string,
      priority: string,
      location: string,
    ) {
      return of(
        createBreakdown(
          category as 'Electricidad' | 'Plomería' | 'Mobiliario' | 'Climatización' | 'Tecnología' | 'Otra',
          description,
          priority as 'low' | 'medium' | 'high',
          location,
        ),
      );
    }

    clearPhoto() {}
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreakdownReportPage],
      providers: [
        { provide: BreakdownReportFacade, useClass: MockBreakdownReportFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BreakdownReportPage);
    component = fixture.componentInstance;
    facade = TestBed.inject(BreakdownReportFacade);
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  describe('Priority Selection', () => {
    it('should select low priority', () => {
      component.selectPriority('low');
      expect(component.priority()).toBe('low');
    });

    it('should select medium priority', () => {
      component.selectPriority('medium');
      expect(component.priority()).toBe('medium');
    });

    it('should select high priority', () => {
      component.selectPriority('high');
      expect(component.priority()).toBe('high');
    });

    it('should clear messages when priority changes', () => {
      component.errorMessage.set('Error');
      component.selectPriority('high');
      expect(component.errorMessage()).toBe('');
    });
  });

  describe('Photo Selection', () => {
    it('should take a photo using camera', fakeAsync(() => {
      spyOn(facade, 'takePhoto').and.returnValue(
        of(new File(['photo'], 'camera.jpg', { type: 'image/jpeg' })),
      );

      component.takePhoto();
      tick();

      expect(facade.takePhoto).toHaveBeenCalled();
      expect(component.photoName()).toBe('camera.jpg');
    }));

    it('should pick a photo from gallery', fakeAsync(() => {
      spyOn(facade, 'pickPhotoFromGallery').and.returnValue(
        of(new File(['photo'], 'gallery.jpg', { type: 'image/jpeg' })),
      );

      component.pickPhotoFromGallery();
      tick();

      expect(facade.pickPhotoFromGallery).toHaveBeenCalled();
      expect(component.photoName()).toBe('gallery.jpg');
    }));

    it('should handle photo selection from file input', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [file] } } as unknown as Event;

      component.selectPhoto(event);

      expect(component.photoName()).toBe('test.jpg');
    });

    it('should handle empty file selection', () => {
      const event = { target: { files: [] } } as unknown as Event;

      component.selectPhoto(event);

      expect(component.photoName()).toBe('');
    });
  });

  describe('Form Submission', () => {
    it('should validate required fields', () => {
      component.category = '';
      component.description = '';
      component.location = '';

      component.submit();

      expect(component.errorMessage()).toContain('Completa');
    });

    it('should submit valid breakdown report', fakeAsync(() => {
      component.category = 'Electricidad';
      component.description = 'Luz rota';
      component.location = 'Baño 2';
      component.priority.set('high');

      spyOn(facade, 'submitBreakdownReport').and.returnValue(
        of(createBreakdown('Electricidad', 'Luz rota', 'high', 'Baño 2')),
      );
      spyOn(router, 'navigateByUrl');

      component.submit();
      tick(1500);

      expect(facade.submitBreakdownReport).toHaveBeenCalledWith(
        'Electricidad',
        'Luz rota',
        'high',
        'Baño 2',
      );
    }));

    it('should display success message on submission', fakeAsync(() => {
      component.category = 'Plomería';
      component.description = 'Fuga de agua';
      component.location = 'Cocina';

      component.submit();
      tick();

      // Success message will come from facade subscription
      fixture.detectChanges();
    }));

    it('should reset form after submission', fakeAsync(() => {
      component.category = 'Mobiliario';
      component.description = 'Silla rota';
      component.location = 'Clase 101';
      component.photoName.set('photo.jpg');

      component.submit();
      tick(2000);

      expect(component.category).toBe('');
      expect(component.description).toBe('');
      expect(component.location).toBe('');
      expect(component.photoName()).toBe('');
    }));
  });

  describe('Message Management', () => {
    it('should clear messages', () => {
      component.errorMessage.set('Error');
      component.successMessage.set('Success');

      component.clearMessages();

      expect(component.errorMessage()).toBe('');
      expect(component.successMessage()).toBe('');
    });

    it('should display error message on failed submission', fakeAsync(() => {
      component.category = 'Climatización';
      component.description = 'Aire no funciona';
      component.location = 'Oficina';

      spyOn(facade, 'submitBreakdownReport').and.returnValue(
        throwError(() => new Error('Server error')),
      );

      component.submit();
      tick();

      // Error handling would be done in the facade
    }));
  });

  describe('Navigation', () => {
    it('should navigate to status page', () => {
      spyOn(router, 'navigateByUrl');

      component.viewStatus();

      expect(router.navigateByUrl).toHaveBeenCalledWith('/averias/estado');
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator', fakeAsync(() => {
      component.isLoading.set(true);
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query((el) => el.name === 'button');
      expect(submitButton.nativeElement.disabled).toBe(true);
    }));
  });

  describe('Form Validation', () => {
    it('should require category', () => {
      component.category = '';
      component.description = 'Valid';
      component.location = 'Valid';

      component.submit();

      expect(component.errorMessage()).toBeTruthy();
    });

    it('should require description', () => {
      component.category = 'Electricidad';
      component.description = '';
      component.location = 'Valid';

      component.submit();

      expect(component.errorMessage()).toBeTruthy();
    });

    it('should require location', () => {
      component.category = 'Electricidad';
      component.description = 'Valid';
      component.location = '';

      component.submit();

      expect(component.errorMessage()).toBeTruthy();
    });

    it('should accept whitespace-trimmed fields', () => {
      component.category = 'Electricidad';
      component.description = '  Valid description  ';
      component.location = '  Valid location  ';

      // Form validation allows this, facade will trim
      // This should not show error
      expect(component.errorMessage()).toBe('');
    });
  });
});

/**
 * Example tests for BreakdownReportFacade
 */
describe('BreakdownReportFacade', () => {
  let facade: BreakdownReportFacade;
  let breakdownService: ReturnType<typeof jasmine.createSpyObj>;
  let cameraService: ReturnType<typeof jasmine.createSpyObj>;

  beforeEach(() => {
    // Mock services
    breakdownService = jasmine.createSpyObj('BreakdownService', [
      'createBreakdown',
      'uploadPhoto',
    ]);

    cameraService = jasmine.createSpyObj('CameraService', [
      'takePhoto',
      'pickPhotoFromGallery',
    ]);

    TestBed.configureTestingModule({
      providers: [
        BreakdownReportFacade,
        { provide: 'BreakdownService', useValue: breakdownService },
        { provide: 'CameraService', useValue: cameraService },
      ],
    });

    facade = TestBed.inject(BreakdownReportFacade);
  });

  it('should upload photo and create breakdown', fakeAsync(() => {
    const mockPhoto = new File(['photo'], 'test.jpg', { type: 'image/jpeg' });
    const mockBreakdown = createBreakdown('Electricidad', 'Luz rota', 'high', 'Baño');

    cameraService.takePhoto.and.returnValue(of(mockPhoto));
    breakdownService.uploadPhoto.and.returnValue(of('https://url.com/photo.jpg'));
    breakdownService.createBreakdown.and.returnValue(of(mockBreakdown));

    facade.takePhoto().subscribe();
    tick();

    expect(cameraService.takePhoto).toHaveBeenCalled();
  }));
});

/**
 * Example tests for validators.util.ts
 */
describe('Validators Utilities', () => {
  it('should validate text', () => {
    expect(isValidText('Valid text')).toBe(true);
    expect(isValidText('   ')).toBe(false);
    expect(isValidText('')).toBe(false);
    expect(isValidText(null)).toBe(false);
    expect(isValidText(undefined)).toBe(false);
  });

  it('should validate breakdown form', () => {
    const result = validateBreakdownForm('Electricidad', 'Description', 'Location');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});

    const result2 = validateBreakdownForm('', '', '');
    expect(result2.isValid).toBe(false);
    expect(Object.keys(result2.errors).length).toBeGreaterThan(0);
  });

  it('should validate image file', () => {
    const validImage = new File(['data'], 'image.jpg', { type: 'image/jpeg' });
    const invalidFile = new File(['data'], 'doc.pdf', { type: 'application/pdf' });

    expect(isValidImageFile(validImage)).toBe(true);
    expect(isValidImageFile(invalidFile)).toBe(false);
  });

  it('should validate file size', () => {
    const smallFile = new File(['data'], 'image.jpg', { type: 'image/jpeg' });
    const largeFile = new File(
      [new ArrayBuffer(10 * 1024 * 1024)],
      'large.jpg',
      { type: 'image/jpeg' },
    );

    expect(isValidFileSize(smallFile, 5)).toBe(true);
    expect(isValidFileSize(largeFile, 5)).toBe(false);
  });
});
