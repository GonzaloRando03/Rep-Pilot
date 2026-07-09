const THRESHOLDS: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: "year", seconds: 365 * 24 * 3600 },
  { unit: "month", seconds: 30 * 24 * 3600 },
  { unit: "week", seconds: 7 * 24 * 3600 },
  { unit: "day", seconds: 24 * 3600 },
  { unit: "hour", seconds: 3600 },
  { unit: "minute", seconds: 60 },
  { unit: "second", seconds: 1 },
];

export function formatRelativeTime(
  date: string | Date,
  locale: string,
): string {
  const diffSeconds = (new Date(date).getTime() - Date.now()) / 1000;
  const absSeconds = Math.abs(diffSeconds);

  const match =
    THRESHOLDS.find((t) => absSeconds >= t.seconds) ??
    THRESHOLDS[THRESHOLDS.length - 1];

  const value = Math.round(diffSeconds / match.seconds);

  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
    value,
    match.unit,
  );
}
