import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

const TITLES = [
  { match: /^\/dashboard/, title: "Dashboard" },
  { match: /^\/scan/, title: "Scan a Card" },
  { match: /^\/business-cards\/[^/]+\/edit/, title: "Edit Card" },
  { match: /^\/business-cards\/[^/]+/, title: "Card Details" },
  { match: /^\/business-cards/, title: "Business Cards" },
  { match: /^\/companies\/[^/]+/, title: "Company Details" },
  { match: /^\/companies/, title: "Companies" },
  { match: /^\/users\/[^/]+/, title: "User Details" },
  { match: /^\/users/, title: "Users" },
  { match: /^\/audit-logs/, title: "Audit Logs" },
  { match: /^\/profile/, title: "Profile & Settings" },
];

const resolveTitle = (pathname) =>
  TITLES.find((t) => t.match.test(pathname))?.title || "CardVault";

export const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} title={resolveTitle(location.pathname)} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
