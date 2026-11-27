import { apiRequest } from "./client";

const toQueryString = (params = {}) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
};

export const getTours = (params) => apiRequest(`/tours${toQueryString(params)}`);

export const getTour = (id) => apiRequest(`/tours/${id}`);

export const createTour = (payload) =>
  apiRequest("/tours", {
    method: "POST",
    body: payload
  });

export const updateTour = (id, payload) =>
  apiRequest(`/tours/${id}`, {
    method: "PATCH",
    body: payload
  });

export const deleteTour = (id) =>
  apiRequest(`/tours/${id}`, {
    method: "DELETE"
  });

