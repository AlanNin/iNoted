export function formatLongDate(date: string | Date) {
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date format");
  }

  const day = parsedDate.getDate();
  const month = parsedDate.toLocaleString("default", { month: "short" });
  const year = parsedDate.getFullYear();
  const hours = parsedDate.getHours() % 12 || 12;
  const minutes = parsedDate.getMinutes().toString().padStart(2, "0");
  const period = parsedDate.getHours() < 12 ? "AM" : "PM";

  return `${day} ${month} ${year}, ${hours}:${minutes} ${period}`;
}

export function formatMediumDate(date: string | Date) {
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date format");
  }

  const day = parsedDate.getDate();
  const month = parsedDate.toLocaleString("default", { month: "short" });
  const year = parsedDate.getFullYear();

  return `${day} ${month} ${year}`;
}
