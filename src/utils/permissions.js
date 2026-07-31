import { ROLES } from "../config/roles.js";

const { SUPER_ADMIN, MAIN_COMPANY_ADMIN, COMPANY_ADMIN, STAFF, NORMAL_USER } = ROLES;

// These helpers exist purely to drive frontend UI decisions (what to
// show/hide/enable). The backend re-enforces every one of these rules
// independently — the frontend checks are for UX only, never security.

export const isSuperAdmin = (user) => user?.role === SUPER_ADMIN;
export const isMainCompanyAdmin = (user) => user?.role === MAIN_COMPANY_ADMIN;
export const isCompanyAdmin = (user) => user?.role === COMPANY_ADMIN;
export const isStaff = (user) => user?.role === STAFF;
export const isNormalUser = (user) => user?.role === NORMAL_USER;

// company.controller.js: createCompany
export const canCreateCompany = (user) => isSuperAdmin(user);

// company.service.js: updateCompany / deleteCompany / recoverCompany /
// changeMainAdmin / updateSubscription / searchCompanies / getCompanyStats
export const canManageCompanyGlobally = (user) => isSuperAdmin(user);

// company.service.js: addCompanyAdmin / removeCompanyAdmin
export const canManageCompanyAdmins = (user) => isMainCompanyAdmin(user);

// company.service.js: addStaff / removeStaff
export const canManageStaffRoster = (user) =>
  isMainCompanyAdmin(user) || isCompanyAdmin(user);

// user.service.js: createUser — COMPANY_ADMIN additionally needs the
// canManageStaff flag on their own user document.
export const canCreateStaffUser = (user) =>
  isCompanyAdmin(user) && !!user?.canManageStaff;

export const canCreateUsers = (user) =>
  isSuperAdmin(user) || isMainCompanyAdmin(user) || canCreateStaffUser(user);

// Views scoped to "my company" data (dashboard/company detail/etc.)
export const hasCompanyScope = (user) =>
  isMainCompanyAdmin(user) || isCompanyAdmin(user) || isStaff(user);

// businessCard.controller.js: canAccessCard — used only to decide
// whether to *attempt* an edit/delete action in the UI; the backend
// is authoritative.
export const canLikelyEditCard = (user, card) => {
  if (!user || !card) return false;
  if (isSuperAdmin(user)) return true;
  if (isMainCompanyAdmin(user)) {
    return String(card.companyId) === String(user.companyId);
  }
  const createdById = card.createdBy?._id || card.createdBy;
  return String(createdById) === String(user.id || user._id);
};
