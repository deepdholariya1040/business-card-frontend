import { NavLink } from "react-router-dom";
import { ScanLine, X } from "lucide-react";
import { NAV_ITEMS, isNavItemVisible } from "../../config/navigation.js";
import { useAuth } from "../../hooks/useAuth.js";
import { cx } from "../../utils/format.js";

export const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();

  const content = (
    <div className="flex h-full flex-col bg-ink-950 text-ink-100">
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal/15 text-signal">
            <ScanLine className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-bold leading-none text-white">CardVault</p>
            <p className="text-[11px] text-ink-400">Business Card Intelligence</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-md p-1 text-ink-400 hover:bg-white/5 lg:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 scrollbar-thin">
        {NAV_ITEMS.filter((item) => isNavItemVisible(item, user?.role)).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              cx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white"
              )
            }
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/5 px-5 py-4">
        <p className="text-[11px] text-ink-500">CardVault Frontend v1.0</p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 lg:block">{content}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/60" onClick={onClose} />
          <div className="relative z-10 h-full w-64 animate-fadeIn">{content}</div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
