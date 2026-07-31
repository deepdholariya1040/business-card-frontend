import api from "../lib/axios.js";

// GET /companies — SUPER_ADMIN gets all; every other role gets only
// their own company.
export const fetchCompanies = () => api.get("/companies").then((r) => r.data.data);

// GET /companies/search?keyword=&status=active|blocked|expired&email=
// SUPER_ADMIN only.
export const searchCompanies = (params) =>
  api.get("/companies/search", { params }).then((r) => r.data.data);

// GET /companies/stats — SUPER_ADMIN only.
export const fetchCompanyStats = () => api.get("/companies/stats").then((r) => r.data.data);

// GET /companies/:id
export const fetchCompanyById = (id) => api.get(`/companies/${id}`).then((r) => r.data.data);

// GET /companies/:id/users — name/email/role/avatar/isActive only.
export const fetchCompanyUsers = (id) =>
  api.get(`/companies/${id}/users`).then((r) => r.data.data);

// POST /companies — SUPER_ADMIN only.
// payload: { name, mainAdminEmail, maxCompanyAdmins?, maxStaff?, subscription: { expiryDate, startDate? } }
export const createCompany = (payload) => api.post("/companies", payload).then((r) => r.data);

// PUT /companies/:id — SUPER_ADMIN only.
export const updateCompany = (id, payload) =>
  api.put(`/companies/${id}`, payload).then((r) => r.data);

// DELETE /companies/:id — deactivates (soft), demotes all company users
// to NORMAL_USER. SUPER_ADMIN only.
export const deactivateCompany = (id) => api.delete(`/companies/${id}`).then((r) => r.data);

// PUT /companies/:id/recover — SUPER_ADMIN only.
export const recoverCompany = (id) =>
  api.put(`/companies/${id}/recover`).then((r) => r.data);

// PUT /companies/:id/change-main-admin { email } — SUPER_ADMIN only.
export const changeMainAdmin = (id, email) =>
  api.put(`/companies/${id}/change-main-admin`, { email }).then((r) => r.data);

// POST /companies/:id/admins { email } — MAIN_COMPANY_ADMIN only.
export const addCompanyAdmin = (id, email) =>
  api.post(`/companies/${id}/admins`, { email }).then((r) => r.data);

// DELETE /companies/:id/admins/:userId — MAIN_COMPANY_ADMIN only.
export const removeCompanyAdmin = (id, userId) =>
  api.delete(`/companies/${id}/admins/${userId}`).then((r) => r.data);

// POST /companies/:id/staff { email } — MAIN_COMPANY_ADMIN or COMPANY_ADMIN.
export const addStaff = (id, email) =>
  api.post(`/companies/${id}/staff`, { email }).then((r) => r.data);

// DELETE /companies/:id/staff/:userId — MAIN_COMPANY_ADMIN or COMPANY_ADMIN.
export const removeStaff = (id, userId) =>
  api.delete(`/companies/${id}/staff/${userId}`).then((r) => r.data);

// PUT /companies/:id/subscription { startDate?, expiryDate? } — SUPER_ADMIN only.
export const updateSubscription = (id, payload) =>
  api.put(`/companies/${id}/subscription`, payload).then((r) => r.data);

// PUT /companies/:id/users/:userId/role { role }
export const changeUserRole = (companyId, userId, role) =>
  api.put(`/companies/${companyId}/users/${userId}/role`, { role }).then((r) => r.data);


// GET /users/company-users
// Used by Business Cards filters (Member dropdown)
export const fetchBusinessCardUsers = (params = {}) =>
  api.get("/users/company-users", { params }).then((r) => r.data.data);