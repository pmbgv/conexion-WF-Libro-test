import { format, isToday, addDays, startOfWeek, endOfWeek } from "date-fns";

export interface DayInfo {
  name: string;
  date: string;
  fullDate: Date;
  isToday: boolean;
}

/**
 * Gets an array of day information for a week starting from the given date
 */
export function getDaysOfWeek(startDate: Date): DayInfo[] {
  const days: DayInfo[] = [];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  for (let i = 0; i < 7; i++) {
    const date = addDays(startDate, i);
    days.push({
      name: dayNames[i],
      date: format(date, "MMM d"),
      fullDate: date,
      isToday: isToday(date)
    });
  }
  
  return days;
}

/**
 * Format a date range as a string (e.g., "May 13 - May 19, 2025")
 */
export function formatDateRange(start: Date, end: Date): string {
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();
  
  if (sameMonth && sameYear) {
    return `${format(start, "MMM d")} - ${format(end, "d, yyyy")}`;
  } else if (sameYear) {
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
  } else {
    return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
  }
}

/**
 * Get current week bounds (Monday to Sunday)
 */
export function getCurrentWeekBounds() {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
  
  return {
    startDate: weekStart,
    endDate: weekEnd
  };
}

/**
 * Format time for display (e.g., "9:00 AM")
 */
export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  const hoursNum = parseInt(hours, 10);
  const period = hoursNum >= 12 ? 'PM' : 'AM';
  const displayHours = hoursNum % 12 || 12;
  
  return `${displayHours}:${minutes} ${period}`;
}
