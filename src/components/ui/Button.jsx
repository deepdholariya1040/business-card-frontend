import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cx } from "../../utils/format.js";

const variants = {
  primary: "bg-ink-900 text-white hover:bg-ink-800 focus-visible:ring-ink-900",
  signal: "bg-signal text-ink-950 hover:bg-signal-dark hover:text-white",
  outline: "border border-ink-200 text-ink-700 bg-white hover:bg-ink-50",
  ghost: "text-ink-600 hover:bg-ink-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
  subtle: "bg-ink-100 text-ink-700 hover:bg-ink-200",
};

const sizes = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

const Button = forwardRef(
  (
    {
      variant = "primary",
      size = "md",
      className,
      isLoading,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cx(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
