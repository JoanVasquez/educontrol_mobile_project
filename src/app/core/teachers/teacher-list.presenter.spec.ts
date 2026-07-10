import { TeacherListPresenter } from './teacher-list.presenter';
import type { Teacher } from './teacher.model';

describe('TeacherListPresenter', () => {
  it('builds unique readable labels for the teacher list', () => {
    const teacher: Teacher = {
      id: 'teacher-id',
      firstName: 'Ana',
      lastName: 'Pérez',
      birthDate: '',
      nationality: '',
      gender: '',
      idNumber: '',
      address: '',
      phone: '',
      assignments: [
        { subject: 'Matemáticas', detail: '' },
        { subject: 'Matemáticas', detail: '' },
      ],
      courses: [
        { course: '3ro', section: 'A' },
        { course: '4to', section: 'B' },
      ],
      photoUrl: 'https://example.com/photo.jpg',
      status: 'active',
    };

    expect(new TeacherListPresenter().toListItem(teacher)).toEqual({
      id: 'teacher-id',
      fullName: 'Ana Pérez',
      subjectLabel: 'Matemáticas',
      courseLabel: '3ro A, 4to B',
      photoUrl: 'https://example.com/photo.jpg',
    });
  });
});
