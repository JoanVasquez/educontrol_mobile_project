export class AttendanceDateUtil {
  static today(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60_000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
  }

  static documentId(course: string, date: string, subject = ''): string {
    const normalizedCourse = this.slug(course);
    const normalizedSubject = this.slug(subject);

    return normalizedSubject ? `${date}_${normalizedCourse}_${normalizedSubject}` : `${date}_${normalizedCourse}`;
  }

  private static slug(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
