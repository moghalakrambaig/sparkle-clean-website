// services/databaseservice.ts
// Calls Spring Boot backend instead of localStorage

// src/services/databaseservice.ts
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
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface Password {
  id?: number;        // make id optional
  password: string;
}

const API_URL = "http://localhost:8080/api";
// Base URL for your backend
const BASE_URL = "http://localhost:8080/api";
export const BOOKINGS_URL = `${BASE_URL}/bookings`;



// ============================
// 🔑 AUTH / ADMIN
// ============================

// ✅ Login with password
export async function adminLogin(password: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success === true;
}

// ✅ Get all admin passwords
export async function getPasswords(): Promise<Password[]> {
  const res = await fetch(`${API_URL}/auth/passwords`);
  if (!res.ok) return [];
  return res.json();
}

// ✅ Add new admin password
export const addPassword = async (pw: Password): Promise<Password | null> => {
  const response = await fetch(`${API_URL}/passwords`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pw),
  });
  if (response.ok) {
    return await response.json(); // return created AdminPassword
  }
  return null;
};

// ✅ Delete password by ID
// services/databaseservice.ts

export const deletePassword = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:8080/api/passwords/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting password:', error);
    return false;
  }
};

// ============================
// 📅 BOOKINGS
// ============================

// ✅ Create booking
export async function createBooking(details: Omit<Booking, "id" | "bookingNumber" | "status">): Promise<Booking> {
  const res = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details),
  });
  return res.json();
}

// ✅ Get booking by number
export const getBookingByNumber = async (bookingNumber: string): Promise<Booking | null> => {
  try {
    const response = await fetch(`http://localhost:8080/api/bookings/number/${bookingNumber}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error fetching booking:", error);
    return null;
  }
};


// ✅ Get all bookings
export async function getAllBookings(): Promise<Booking[]> {
  const res = await fetch(`${API_URL}/bookings`);
  if (!res.ok) return [];
  return res.json();
}

// ✅ Update booking status
export const updateBookingStatus = async (
  id: number,
  status: "Pending" | "Approved" | "Rejected"
): Promise<boolean> => {
  const response = await fetch(`${BOOKINGS_URL}/${id}/status?status=${status}`, {
    method: "PUT",
  });
  return response.ok;
};


// ✅ Delete booking
export async function deleteBooking(bookingId: number): Promise<boolean> {
  const res = await fetch(`${API_URL}/bookings/${bookingId}`, {
    method: "DELETE",
  });
  return res.ok;
}
