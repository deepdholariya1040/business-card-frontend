import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cx } from "../../utils/format.js";

export const Modal = ({ open, onClose, title, children, footer, size = "md" }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/50 animate-fadeIn" onClick={onClose} />
      <div
        className={cx(
          "relative z-10 w-full animate-fadeIn rounded-xl2 bg-white shadow-2xl",
          widths[size]
        )}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h3 className="text-base font-semibold text-ink-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-600"
            aria-label="Close"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5 scrollbar-thin">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-4">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
