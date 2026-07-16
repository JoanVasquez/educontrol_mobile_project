const SECONDS_PER_MINUTE = 60;

export function formatMediaTime(valueInSeconds: number): string {
  if (!Number.isFinite(valueInSeconds) || valueInSeconds <= 0) {
    return '00:00';
  }

  const totalSeconds = Math.floor(valueInSeconds);
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
