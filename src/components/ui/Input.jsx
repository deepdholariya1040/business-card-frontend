import { forwardRef } from "react";
import { cx } from "../../utils/format.js";

export const Field = ({ label, error, hint, required, children, className }) => (
  <div className={cx("flex flex-col gap-1.5", className)}>
    {label && (
      <label className="text-sm font-medium text-ink-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
    )}
    {children}
    {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    {!error && hint && <p className="text-xs text-ink-400">{hint}</p>}
  </div>
);

const baseInputStyles =
  "h-10 w-full rounded-lg border bg-white px-3 text-sm text-ink-800 placeholder:text-ink-300 transition-colors focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-0 disabled:bg-ink-50 disabled:text-ink-400";

export const Input = forwardRef(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={cx(baseInputStyles, error ? "border-red-300" : "border-ink-200", className)}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = forwardRef(({ className, error, rows = 3, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cx(
      "w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-ink-800 placeholder:text-ink-300 transition-colors focus-visible:ring-2 focus-visible:ring-signal disabled:bg-ink-50",
      error ? "border-red-300" : "border-ink-200",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef(({ className, error, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cx(baseInputStyles, "appearance-none bg-no-repeat pr-8", error ? "border-red-300" : "border-ink-200", className)}
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394A3B8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
      backgroundPosition: "right 0.6rem center",
      backgroundSize: "1.1em",
    }}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export const Checkbox = forwardRef(({ label, className, ...props }, ref) => (
  <label className={cx("flex items-center gap-2 text-sm text-ink-700", className)}>
    <input
      ref={ref}
      type="checkbox"
      className="h-4 w-4 rounded border-ink-300 text-signal-dark focus-visible:ring-signal"
      {...props}
    />
    {label}
  </label>
));
Checkbox.displayName = "Checkbox";
