import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://10.197.244.22:5000/api';

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

  // Get appointments (Protected - Handles both roles)
  getAppointments: async (role, date) => {
    const headers = await getHeaders();
    const path = role === 'PATIENT' ? 'patients/me/appointments' : `dentists/me/appointments?date=${date}`;
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
  }
};