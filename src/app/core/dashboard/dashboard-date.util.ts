export class DashboardDateUtil {
  static lastDays(today: string, amount: number): string[] {
    const [year, month, day] = today.split('-').map(Number);
    const baseDate = new Date(year, month - 1, day);

    return Array.from({ length: amount }, (_, index) => {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() - (amount - 1 - index));
      return this.formatDateId(date);
    });
  }

  private static formatDateId(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }
}
