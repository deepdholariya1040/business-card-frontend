import { format, formatDistanceToNow, isValid } from "date-fns";

export const formatDate = (value, pattern = "MMM d, yyyy") => {
  if (!value) return "—";
  const date = new Date(value);
  return isValid(date) ? format(date, pattern) : "—";
};

export const formatDateTime = (value) => formatDate(value, "MMM d, yyyy 'at' h:mm a");

export const formatRelative = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : "—";
};

export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

export const formatNumber = (value) =>
  typeof value === "number" ? value.toLocaleString() : value ?? "—";

// e.g. 12 / 25 -> 48
export const percentOf = (used, limit) => {
  if (!limit || limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
};

export const cx = (...classes) => classes.filter(Boolean).join(" ");
