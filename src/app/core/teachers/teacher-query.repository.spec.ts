import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TeacherQueryRepository } from './teacher-query.repository';

describe('TeacherQueryRepository', () => {
  let repository: TeacherQueryRepository;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TeacherQueryRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(TeacherQueryRepository);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('loads authenticated active teachers from Firestore', (done) => {
    repository.findAll('id-token').subscribe((teachers) => {
      expect(teachers.length).toBe(1);
      expect(teachers[0].id).toBe('active-id');
      done();
    });

    const request = httpTesting.expectOne(
      'https://firestore.googleapis.com/v1/projects/educontrol-mobile/databases/(default)/documents/docentes?pageSize=100',
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe('Bearer id-token');
    request.flush({
      documents: [
        {
          name: 'projects/project/databases/(default)/documents/docentes/active-id',
          fields: {
            firstName: { stringValue: 'Ana' },
            lastName: { stringValue: 'Pérez' },
            status: { stringValue: 'active' },
          },
        },
        {
          name: 'projects/project/databases/(default)/documents/docentes/inactive-id',
          fields: {
            firstName: { stringValue: 'Luis' },
            lastName: { stringValue: 'Díaz' },
            status: { stringValue: 'inactive' },
          },
        },
      ],
    });
  });
});
