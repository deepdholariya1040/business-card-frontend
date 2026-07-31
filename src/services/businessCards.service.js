import api from "../lib/axios.js";

/**
 * GET /business-cards
 *
 * Supports:
 * - search
 * - companyId
 * - role
 * - createdBy
 *
 * Examples:
 * fetchBusinessCards()
 * fetchBusinessCards("john")
 * fetchBusinessCards("john", companyId, role, createdBy)
 */
export const fetchBusinessCards = (
  search = "",
  companyId = "",
  role = "",
  createdBy = ""
) => {
  const params = {};

  if (search) {
    params.search = search;
  }

  if (companyId) {
    params.companyId = companyId;
  }

  if (role) {
    params.role = role;
  }

  if (createdBy) {
    params.createdBy = createdBy;
  }

  return api
    .get("/business-cards", { params })
    .then((response) => response.data.data);
};

// GET /business-cards/:id
export const fetchBusinessCardById = (id) => {
  console.log("fetchBusinessCardById id:", id, typeof id);

  return api
    .get(`/business-cards/${id}`)
    .then((response) => response.data.data);
};

// PUT /business-cards/:id
export const updateBusinessCard = (id, payload) =>
  api
    .put(`/business-cards/${id}`, payload)
    .then((response) => response.data);

// DELETE /business-cards/:id
export const deleteBusinessCard = (id) =>
  api
    .delete(`/business-cards/${id}`)
    .then((response) => response.data);