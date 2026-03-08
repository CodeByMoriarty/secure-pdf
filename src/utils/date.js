export function parseDate(input) {
  if (input instanceof Date) return input;
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function isFutureDate(input) {
  const date = parseDate(input);
  return date !== null && date > new Date();
}

export function toISODate(input) {
  const date = parseDate(input);
  return date?.toISOString().split('T')[0] ?? null;
}

export function formatDate(input) {
  const date = parseDate(input);
  if (!date) return null;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
