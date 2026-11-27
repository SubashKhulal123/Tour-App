import { apiRequest } from "./client";

export const createBooking = (payload) =>
  apiRequest("/bookings", {
    method: "POST",
    body: payload
  });

export const getMyBookings = () => apiRequest("/bookings/my");

export const getBookings = (status = "") =>
  apiRequest(status ? `/bookings?status=${encodeURIComponent(status)}` : "/bookings");

export const updateBookingStatus = (id, status) =>
  apiRequest(`/bookings/${id}/status`, {
    method: "PATCH",
    body: { status }
  });

export const createCheckoutSession = (tourId, numberOfPeople) =>
  apiRequest("/bookings/checkout-session", {
    method: "POST",
    body: { tourId, numberOfPeople }
  });

