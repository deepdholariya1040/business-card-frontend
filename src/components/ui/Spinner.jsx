import { Loader2 } from "lucide-react";
import { cx } from "../../utils/format.js";

export const Spinner = ({ className, size = 20 }) => (
  <Loader2 className={cx("animate-spin text-ink-400", className)} size={size} />
);

export const PageLoader = ({ label = "Loading…" }) => (
  <div className="flex h-full min-h-[240px] w-full flex-col items-center justify-center gap-3 text-ink-400">
    <Spinner size={28} />
    <p className="text-sm">{label}</p>
  </div>
);

export default Spinner;
