export function timestampToISO(seconds) {
  const ms = seconds * 1000;
  if (!Number.isFinite(ms)) return null;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

// Converts a value from <input type="datetime-local"> (local time, no
// timezone) into a Unix timestamp in seconds.
export function localDatetimeToTimestamp(localValue) {
  if (!localValue) return null;
  const date = new Date(localValue);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor(date.getTime() / 1000);
}

// Converts a Unix timestamp (seconds) into a value usable by
// <input type="datetime-local"> in the user's local timezone.
export function timestampToLocalDatetime(seconds) {
  const ms = seconds * 1000;
  if (!Number.isFinite(ms)) return null;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
