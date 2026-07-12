export function extractBirthDateValue(value: string | string[] | null | undefined): string {
  const selectedDate = Array.isArray(value) ? value[0] : value;
  return selectedDate ? selectedDate.slice(0, 10) : '';
}

export function formatBirthDateLabel(value: string): string {
  if (!value) {
    return 'Seleccione fecha';
  }

  const [year, month, day] = value.slice(0, 10).split('-');
  return day && month && year ? `${day}/${month}/${year}` : value;
}
