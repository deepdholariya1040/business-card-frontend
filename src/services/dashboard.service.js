import api from "../lib/axios.js";

// GET /dashboard — { totalUsers, totalCompanies, totalCards, todayScans,
// monthlyScans, yearlyScans, limits: {daily, monthly, yearly} }
export const fetchDashboardStats = () => api.get("/dashboard").then((r) => r.data.data);
