export function formatDateTime(
  input: Date,
  format: "dd-mm-yyyy hh:mm:ss" | "yyyy-mm-dd"
): string {
  const d = input instanceof Date ? input : new Date(input);
  const pad = (n: number) => String(n).padStart(2, "0");

  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yyyy = String(d.getFullYear());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());

  if (format === "dd-mm-yyyy hh:mm:ss") {
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;
  } else {
    return `${yyyy}-${mm}-${dd}`;
  }
}
