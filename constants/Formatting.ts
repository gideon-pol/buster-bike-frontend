
export function formatDate(date: Date): string {
  return date.toLocaleDateString("nl-NL", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  })
}