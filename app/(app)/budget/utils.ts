import { parseLocalDate, formatLocalDate } from "@/lib/date-utils";

// uses local timezone to avoid UTC conversion issues
export function calculateEndDate(startDate: string): string {
  const start = parseLocalDate(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 30);
  return formatLocalDate(end);
}

// get today's date in ISO format (YYYY-MM-DD) in local timezone
export function getTodayISO(): string {
  return formatLocalDate(new Date());
}
