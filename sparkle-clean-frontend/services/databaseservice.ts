// src/services/databaseservice.ts

// Base URL (from .env or default localhost)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:8080/api";

// ==================== BOOKINGS ====================

export interface Booking {
  id: number;
  bookingNumber: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  service: string;
  date: string;
  time: string;
  status: "Pending" | "Approved" | "Rejected";
}

export const getAllBookings = async (): Promise<Booking[]> => {
  const res = await fetch(`${API_BASE_URL}/bookings`);
  return res.ok ? res.json() : [];
};

export const getBookingById = async (id: number): Promise<Booking | null> => {
  const res = await fetch(`${API_BASE_URL}/bookings/${id}`);
  return res.ok ? res.json() : null;
};

export const getBookingByNumber = async (
  bookingNumber: string
): Promise<Booking | null> => {
  const res = await fetch(`${API_BASE_URL}/bookings/number/${bookingNumber}`);
  return res.ok ? res.json() : null;
};

export const createBooking = async (
  booking: Omit<Booking, "id" | "bookingNumber" | "status">
): Promise<Booking | null> => {
  const res = await fetch(`${API_BASE_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
  });
  return res.ok ? res.json() : null;
};

export const updateBookingStatus = async (
  id: number,
  status: "Pending" | "Approved" | "Rejected"
): Promise<boolean> => {
  const res = await fetch(`${API_BASE_URL}/bookings/${id}/status?status=${status}`, {
    method: "PUT",
  });
  return res.ok;
};

export const deleteBooking = async (id: number): Promise<boolean> => {
  const res = await fetch(`${API_BASE_URL}/bookings/${id}`, {
    method: "DELETE",
  });
  return res.ok;
};

// ==================== ADMIN PASSWORDS ====================

export interface Password {
  id: number;
  password: string;
}

export const login = async (password: string): Promise<boolean> => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.success === true;
};

export const getPasswords = async (): Promise<Password[]> => {
  const res = await fetch(`${API_BASE_URL}/auth/passwords`);
  return res.ok ? res.json() : [];
};

export const addPassword = async (password: Password): Promise<Password | null> => {
  const res = await fetch(`${API_BASE_URL}/auth/passwords`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(password),
  });
  return res.ok ? res.json() : null;
};

export const deletePassword = async (id: number): Promise<boolean> => {
  const res = await fetch(`${API_BASE_URL}/auth/passwords/${id}`, {
    method: "DELETE",
  });
  return res.ok;
};
