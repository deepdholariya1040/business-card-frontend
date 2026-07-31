import api from "../lib/axios.js";

// GET /users
export const fetchUsers = () =>
  api.get("/users").then((r) => r.data.data);

// GET /users/company-users
export const fetchCompanyUsers = (params = {}) =>
  api.get("/users/company-users", { params }).then((r) => r.data.data);

// GET /users/:id
export const fetchUserById = (id) =>
  api.get(`/users/${id}`).then((r) => r.data.data);

// GET /users/:id/cards
export const fetchUserCards = (id) =>
  api.get(`/users/${id}/cards`).then((r) => r.data.data);

// POST /users
export const createUser = (payload) =>
  api.post("/users", payload).then((r) => r.data);

// PUT /users/:id
export const updateUser = (id, payload) =>
  api.put(`/users/${id}`, payload).then((r) => r.data);

// DELETE /users/:id
export const deleteUser = (id) =>
  api.delete(`/users/${id}`).then((r) => r.data);