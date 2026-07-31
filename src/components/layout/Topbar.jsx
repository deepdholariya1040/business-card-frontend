import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut, ChevronDown, Settings } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../context/ToastContext.jsx";
import { roleLabel } from "../../config/roles.js";
import Avatar from "../ui/Avatar.jsx";

export const Topbar = ({ onMenuClick, title }) => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("You've been signed out.");
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-100 bg-white/80 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-md p-1.5 text-ink-500 hover:bg-ink-50 lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-display text-lg font-semibold text-ink-900">{title}</h1>
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-ink-50"
        >
          <Avatar name={user?.name} src={user?.avatar} size="sm" />
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium leading-none text-ink-800">{user?.name}</p>
            <p className="mt-0.5 text-xs leading-none text-ink-400">{roleLabel(user?.role)}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-ink-400" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-ink-100 bg-white shadow-soft animate-fadeIn">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50"
              >
                <Settings className="h-4 w-4" /> Profile & Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 border-t border-ink-100 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Topbar;
