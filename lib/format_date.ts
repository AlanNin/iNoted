import { format, parseISO, isValid } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export function formatLongDate(date: string | Date): string {
  let formatedDate: Date;

  if (typeof date === "string") {
    if (date.includes(" ")) {
      const isoDate = date.replace(" ", "T") + "Z";
      formatedDate = new Date(isoDate);
    } else {
      formatedDate = parseISO(date);
    }
  } else {
    formatedDate = new Date(date);
  }

  if (!isValid(formatedDate)) {
    throw new Error("Invalid date format");
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const zonedDate = toZonedTime(formatedDate, timeZone);

  return format(zonedDate, "MMMM d, yyyy 'at' h:mm a");
}

export function formatMediumDate(date: string | Date) {
  let parsedDate: Date;

  if (typeof date === "string") {
    if (date.includes(" ")) {
      const isoDate = date.replace(" ", "T") + "Z";
      parsedDate = new Date(isoDate);
    } else {
      parsedDate = parseISO(date);
    }
  } else {
    parsedDate = new Date(date);
  }

  if (!isValid(parsedDate)) {
    throw new Error("Invalid date format");
  }

  const day = parsedDate.getDate();
  const month = parsedDate.toLocaleString("default", { month: "short" });
  const year = parsedDate.getFullYear();

  return `${day} ${month}, ${year}`;
}

export function formatMediumDateCalendar(date: string | Date) {
  let parsedDate: Date;

  if (typeof date === "string") {
    if (date.includes(" ")) {
      const isoDate = date.replace(" ", "T") + "Z";
      parsedDate = new Date(isoDate);
    } else {
      parsedDate = parseISO(date);
    }
  } else {
    parsedDate = new Date(date);
  }

  if (!isValid(parsedDate)) {
    throw new Error("Invalid date format");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsedDate.setHours(0, 0, 0, 0);

  if (today.getTime() === parsedDate.getTime()) {
    return "Today";
  }

  const day = parsedDate.getDate();
  const month = parsedDate.toLocaleString("default", { month: "short" });
  const year = parsedDate.getFullYear();

  return `${day} ${month}, ${year}`;
}

export function getMaxDateInUTC(): string {
  const currentDate = new Date();

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const zonedDate = toZonedTime(currentDate, timeZone);

  zonedDate.setHours(0, 0, 0, 0);

  const utcDate = toZonedTime(zonedDate, "UTC");

  return format(utcDate, "yyyy-MM-dd");
}
