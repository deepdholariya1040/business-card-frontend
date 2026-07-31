import {
  LayoutDashboard,
  ScanLine,
  IdCard,
  Building2,
  Users,
  ScrollText,
  UserCircle,
} from "lucide-react";
import { ROLES } from "./roles.js";

const { SUPER_ADMIN, MAIN_COMPANY_ADMIN, COMPANY_ADMIN, STAFF, NORMAL_USER } =
  ROLES;

// Sidebar navigation
export const NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    roles: null,
  },
  {
    label: "Scan a Card",
    to: "/scan",
    icon: ScanLine,
    roles: null,
  },
  {
    label: "Business Cards",
    to: "/business-cards",
    icon: IdCard,
    roles: null,
  },
  {
    label: "Companies",
    to: "/companies",
    icon: Building2,
    roles: [SUPER_ADMIN, MAIN_COMPANY_ADMIN, COMPANY_ADMIN],
  },
  {
    label: "Users",
    to: "/users",
    icon: Users,
    roles: [SUPER_ADMIN],
  },
  {
    label: "Audit Logs",
    to: "/audit-logs",
    icon: ScrollText,
    roles: [SUPER_ADMIN],
  },
  {
    label: "Profile",
    to: "/profile",
    icon: UserCircle,
    roles: null,
  },
];

export const isNavItemVisible = (item, role) => {
  if (!item.roles) return true;
  return item.roles.includes(role);
};
