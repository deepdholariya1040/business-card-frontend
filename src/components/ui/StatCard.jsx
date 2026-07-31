import { cx, formatNumber } from "../../utils/format.js";

export const StatCard = ({ icon: Icon, label, value, accent = false, hint }) => (
  <div
    className={cx(
      "flex items-start justify-between rounded-xl2 border p-5 shadow-card",
      accent ? "border-signal/30 bg-gradient-to-br from-ink-900 to-ink-800 text-white" : "border-ink-100 bg-white"
    )}
  >
    <div>
      <p className={cx("text-xs font-medium uppercase tracking-wide", accent ? "text-ink-300" : "text-ink-400")}>
        {label}
      </p>
      <p className={cx("mt-2 font-display text-3xl font-bold", accent ? "text-white" : "text-ink-900")}>
        {formatNumber(value)}
      </p>
      {hint && <p className={cx("mt-1 text-xs", accent ? "text-ink-300" : "text-ink-400")}>{hint}</p>}
    </div>
    {Icon && (
      <div
        className={cx(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          accent ? "bg-white/10 text-signal" : "bg-signal/10 text-signal-dark"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
    )}
  </div>
);

export default StatCard;
