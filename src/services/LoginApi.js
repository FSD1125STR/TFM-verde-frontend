const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
import { setAuthToken } from './authToken.js';

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/employee/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`${responseData.message}`);
    }

    if (responseData.token) {
      setAuthToken(responseData.token);
    }

    return responseData;
  } catch (error) {
    console.error('Error Fetch Login:', error.message);
    throw error;
  }
};
