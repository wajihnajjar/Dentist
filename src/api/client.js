import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://192.168.1.10:5000/api';

const getHeaders = async () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  try {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error fetching token', error);
  }
  return headers;
};

export const api = {
  // --- AUTHENTICATION ---
  register: async (data) => {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  socialLogin: async (data) => {
    const response = await fetch(`${BASE_URL}/auth/social-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  login: async (data) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // --- DENTISTS ---
  // Get all dentists for the map (Supports optional lat, lng, radius)
  getDentists: async (lat, lng, radius) => {
    let query = '';
    if (lat && lng) {
      query = `?lat=${lat}&lng=${lng}`;
      if (radius) query += `&radius=${radius}`;
    }
    const response = await fetch(`${BASE_URL}/dentists${query}`);
    return response.json();
  },
  
  // Get available slots for a specific date
  getSlots: async (dentistId, date) => {
    const response = await fetch(`${BASE_URL}/dentists/${dentistId}/slots?date=${date}`);
    return response.json();
  },

  // --- USERS ---
  // Get current user profile (Protected)
  getMe: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/users/me`, { headers });
    return response.json();
  },
    
  // --- APPOINTMENTS ---
  // Create an appointment (Protected - Patient Only)
  createAppointment: async (data) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Get single appointment
  getAppointment: async (appointmentId) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/appointments/${appointmentId}`, { headers });
    return response.json();
  },

  // Update appointment details (Dentist Only)
  updateAppointmentDetails: async (appointmentId, data) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/appointments/${appointmentId}/details`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Confirm an appointment (Protected - Dentist Only)
  confirmAppointment: async (appointmentId) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/appointments/${appointmentId}/confirm`, {
      method: 'POST',
      headers,
    });
    return response.json();
  },

  // Cancel an appointment (Protected)
  cancelAppointment: async (appointmentId) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/appointments/${appointmentId}/cancel`, {
      method: 'POST',
      headers,
    });
    return response.json();
  },

  // Get appointments (Protected - Handles both roles)
  getAppointments: async (role, date) => {
    const headers = await getHeaders();
    let path = role === 'PATIENT' ? 'patients/me/appointments' : 'dentists/me/appointments';
    if (date) {
      path += `?date=${date}`;
    }
    const response = await fetch(`${BASE_URL}/${path}`, { headers });
    return response.json();
  },

  // Toggle blocked date for Dentist (Protected - Dentist Only)
  toggleBlockedDate: async (date, isBlocked) => {
    const headers = await getHeaders();
    const method = isBlocked ? 'DELETE' : 'POST';
    const path = isBlocked ? `dentists/me/blocked-dates/${date}` : 'dentists/me/blocked-dates';
    const response = await fetch(`${BASE_URL}/${path}`, {
      method,
      headers,
      body: isBlocked ? null : JSON.stringify({ blocked_date: date })
    });
    return response.json();
  },

  // Update schedules for Dentist (Protected - Dentist Only)
  updateSchedule: async (schedules) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/dentists/me/schedules`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ schedules })
    });
    return response.json();
  },

  // Update patient profile (Protected - Patient Only)
  updatePatientProfile: async (data) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/patients/me`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Update dentist profile (Protected - Dentist Only)
  updateProfile: async (data) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/dentists/me`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Rate a completed appointment (Protected - Patient Only)
  rateAppointment: async (appointmentId, data) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/appointments/${appointmentId}/rate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    return response.json();
  }
};