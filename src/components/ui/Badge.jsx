import { cx } from "../../utils/format.js";
import { ROLES } from "../../config/roles.js";

const tones = {
  neutral: "bg-ink-100 text-ink-600",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  danger: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  signal: "bg-signal/10 text-signal-dark ring-1 ring-inset ring-signal/30",
  indigo: "bg-indigo-600/10 text-indigo-700 ring-1 ring-inset ring-indigo-600/20",
};

export const Badge = ({ tone = "neutral", className, children }) => (
  <span
    className={cx(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
      tones[tone],
      className
    )}
  >
    {children}
  </span>
);

const ROLE_TONE = {
  [ROLES.SUPER_ADMIN]: "indigo",
  [ROLES.MAIN_COMPANY_ADMIN]: "signal",
  [ROLES.COMPANY_ADMIN]: "success",
  [ROLES.STAFF]: "warning",
  [ROLES.NORMAL_USER]: "neutral",
};

export const RoleBadge = ({ role, label }) => (
  <Badge tone={ROLE_TONE[role] || "neutral"}>{label || role}</Badge>
);

export default Badge;
