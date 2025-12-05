export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayLocal(): string {
  return formatLocalDate(new Date());
}

export function getTodayUTC(): string {
  return new Date().toISOString().split("T")[0];
}

export function parseLocalDateIfPossible(dateString: string): Date {
  // check if it's a date-only string (YYYY-MM-DD)
  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (dateOnlyPattern.test(dateString)) {
    return parseLocalDate(dateString);
  }

  return new Date(dateString);
}
