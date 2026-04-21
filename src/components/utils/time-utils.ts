/** Normalizes text for case-insensitive comparisons and filtering. */
export function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

/** Formats time as HH:MM:SS in Slovak locale, or fallback dash for null. */
export function formatClockTime(date: Date | null): string {
  if (!date) {
    return '—';
  }

  return date.toLocaleTimeString('sk-SK', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/** Formats date and time in Slovak locale, or fallback dash for null. */
export function formatDateTime(date: Date | null): string {
  if (!date) {
    return '—';
  }

  return date.toLocaleString('sk-SK', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });
}

/** Converts milliseconds to HH:MM:SS with rounding up to whole seconds. */
export function formatDuration(milliseconds: number): string {
  const roundedSeconds = Math.ceil(milliseconds / 1000);
  const hours = Math.floor(roundedSeconds / 3600);
  const minutes = Math.floor((roundedSeconds % 3600) / 60);
  const seconds = roundedSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, '0'))
    .join(':');
}
