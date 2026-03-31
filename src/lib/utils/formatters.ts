import type { Timestamp } from "firebase/firestore";

export function formatDate(ts: Timestamp | undefined): string {
  if (!ts?.toDate) return "—";
  return ts.toDate().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatSalary(
  min: number,
  max: number,
  currency: string,
): string {
  const fmt = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n);
  return `${currency} ${fmt(min)} – ${fmt(max)}`;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function relativeTime(ts: Timestamp | undefined): string {
  if (!ts?.toDate) return "";
  const diff = Date.now() - ts.toDate().getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(ts);
}
