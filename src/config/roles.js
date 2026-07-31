// Mirrors backend/src/config/roles.js exactly. Do not add or rename
// values here without a matching backend change — the backend is the
// source of truth for what these strings mean.
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  MAIN_COMPANY_ADMIN: "MAIN_COMPANY_ADMIN",
  COMPANY_ADMIN: "COMPANY_ADMIN",
  STAFF: "STAFF",
  NORMAL_USER: "NORMAL_USER",
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.MAIN_COMPANY_ADMIN]: "Main Company Admin",
  [ROLES.COMPANY_ADMIN]: "Company Admin",
  [ROLES.STAFF]: "Staff",
  [ROLES.NORMAL_USER]: "Normal User",
};

// The exact role a user of `currentRole` is allowed to create, per
// user.service.js's createUser() switch statement.
export const CREATABLE_ROLE_BY_CREATOR = {
  [ROLES.SUPER_ADMIN]: ROLES.MAIN_COMPANY_ADMIN,
  [ROLES.MAIN_COMPANY_ADMIN]: ROLES.COMPANY_ADMIN,
  [ROLES.COMPANY_ADMIN]: ROLES.STAFF, // additionally requires canManageStaff
};

export const roleLabel = (role) => ROLE_LABELS[role] || role || "—";
