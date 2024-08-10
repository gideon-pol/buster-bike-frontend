
export function formatDate(date: Date): string {
  return date.toLocaleDateString("nl-NL", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  })
}

export function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const formattedTime = `${days.toString().padStart(2, "0")}:${(hours % 24)
    .toString()
    .padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}:${(
    seconds % 60
  )
    .toString()
    .padStart(2, "0")}`;
  return formattedTime;
}