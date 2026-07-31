import { cx } from "../../utils/format.js";

export const Card = ({ className, children, ...props }) => (
  <div className={cx("rounded-xl2 border border-ink-100 bg-white shadow-card", className)} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ className, title, subtitle, action, children }) => (
  <div className={cx("flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4", className)}>
    <div>
      {title && <h3 className="text-base font-semibold text-ink-900">{title}</h3>}
      {subtitle && <p className="mt-0.5 text-sm text-ink-400">{subtitle}</p>}
      {children}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardBody = ({ className, children }) => (
  <div className={cx("p-5", className)}>{children}</div>
);

export default Card;
