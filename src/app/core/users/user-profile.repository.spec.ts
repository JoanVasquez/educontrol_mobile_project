import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserProfileRepository } from './user-profile.repository';

describe('UserProfileRepository', () => {
  let repository: UserProfileRepository;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserProfileRepository, provideHttpClient(), provideHttpClientTesting()],
    });

    repository = TestBed.inject(UserProfileRepository);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should load a user profile from the Firestore user collection', (done) => {
    repository.findByUid('firebase-auth-uid', 'id-token').subscribe((profile) => {
      expect(profile).toEqual({
        uid: 'firebase-auth-uid',
        email: 'admin@example.com',
        fullName: 'Usuario IT',
        codigo: 'ADM-001',
        distrito: '15-03',
        institucion: 'EduControl',
        role: 'admin',
        status: 'active',
        createdAt: new Date('2026-05-16T00:00:00.000Z'),
        updatedAt: new Date('2026-05-16T00:00:00.000Z'),
      });
      done();
    });

    const request = httpTesting.expectOne(
      'https://firestore.googleapis.com/v1/projects/educontrol-mobile/databases/(default)/documents/user/firebase-auth-uid',
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe('Bearer id-token');

    request.flush({
      fields: {
        email: { stringValue: 'admin@example.com' },
        fullName: { stringValue: 'Usuario IT' },
        codigo: { stringValue: 'ADM-001' },
        distrito: { stringValue: '15-03' },
        institucion: { stringValue: 'EduControl' },
        role: { stringValue: ' Admin ' },
        status: { stringValue: ' Active ' },
        createdAt: { timestampValue: '2026-05-16T00:00:00.000Z' },
        updatedAt: { timestampValue: '2026-05-16T00:00:00.000Z' },
      },
    });
  });
});
