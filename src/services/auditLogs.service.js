import api from "../lib/axios.js";

// GET /audit-logs — SUPER_ADMIN sees every log; every other role is
// scoped to their own companyId server-side.
export const fetchAuditLogs = () => api.get("/audit-logs").then((r) => r.data.data);
