import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cx } from "../utils/format.js";

const ToastContext = createContext(null);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, { type = "info", duration = 4500 } = {}) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      success: (msg, opts) => push(msg, { ...opts, type: "success" }),
      error: (msg, opts) => push(msg, { ...opts, type: "error" }),
      info: (msg, opts) => push(msg, { ...opts, type: "info" }),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cx(
              "animate-fadeIn flex items-start gap-2.5 rounded-xl border bg-white p-3.5 shadow-soft",
              t.type === "success" && "border-emerald-200",
              t.type === "error" && "border-red-200",
              t.type === "info" && "border-ink-200"
            )}
          >
            {t.type === "success" && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />}
            {t.type === "error" && <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />}
            {t.type === "info" && <Info className="mt-0.5 h-5 w-5 shrink-0 text-ink-400" />}
            <p className="flex-1 text-sm leading-snug text-ink-700">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded-md p-0.5 text-ink-300 hover:bg-ink-50 hover:text-ink-500"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
