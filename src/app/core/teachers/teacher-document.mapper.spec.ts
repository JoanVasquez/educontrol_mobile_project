import { TeacherDocumentMapper } from './teacher-document.mapper';

describe('TeacherDocumentMapper', () => {
  it('maps a Firestore teacher document into the domain model', () => {
    const teacher = new TeacherDocumentMapper().fromDocument({
      name: 'projects/project/databases/(default)/documents/docentes/teacher-id',
      fields: {
        firstName: { stringValue: ' Ana ' },
        lastName: { stringValue: ' Pérez ' },
        status: { stringValue: 'active' },
        assignments: {
          arrayValue: {
            values: [
              {
                mapValue: {
                  fields: {
                    subject: { stringValue: 'Matemáticas' },
                    detail: { stringValue: 'Álgebra' },
                  },
                },
              },
            ],
          },
        },
        courses: {
          arrayValue: {
            values: [
              {
                mapValue: {
                  fields: {
                    course: { stringValue: '3ro' },
                    section: { stringValue: 'A' },
                  },
                },
              },
            ],
          },
        },
        createdAt: { timestampValue: '2026-06-24T00:00:00.000Z' },
      },
    });

    expect(teacher.id).toBe('teacher-id');
    expect(teacher.firstName).toBe('Ana');
    expect(teacher.assignments).toEqual([{ subject: 'Matemáticas', detail: 'Álgebra' }]);
    expect(teacher.courses).toEqual([{ course: '3ro', section: 'A' }]);
    expect(teacher.createdAt).toEqual(new Date('2026-06-24T00:00:00.000Z'));
  });
});
