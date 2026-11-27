import { apiRequest, getStoredToken } from "./client";

export const getUsers = () => apiRequest("/users");

export const updateUserRole = (id, role) =>
  apiRequest(`/users/${id}/role`, {
    method: "PATCH",
    body: { role }
  });

export const deleteUser = (id) =>
  apiRequest(`/users/${id}`, {
    method: "DELETE"
  });

export const getWishlist = () => apiRequest("/users/me/wishlist");

export const addToWishlist = (tourId) =>
  apiRequest(`/users/me/wishlist/${tourId}`, {
    method: "POST"
  });

export const removeFromWishlist = (tourId) =>
  apiRequest(`/users/me/wishlist/${tourId}`, {
    method: "DELETE"
  });

// Uses raw fetch because FormData (multipart) can't be JSON-stringified
export const updateMe = async (formData) => {
  const token = getStoredToken();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const res = await fetch(`${API_URL}/users/me`, {
    method: "PATCH",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.message || "Update failed");
  return payload;
};
