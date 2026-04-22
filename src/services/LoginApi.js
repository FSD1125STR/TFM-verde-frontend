const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
import { setAuthToken } from './authToken.js';

const parseResponseBody = async (response) => {
  const rawBody = await response.text();
  if (!rawBody) return null;

  try {
    return JSON.parse(rawBody);
  } catch (_error) {
    return null;
  }
};

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/employee/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const responseData = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(
        responseData?.message ||
          `Login failed with status ${response.status}`,
      );
    }

    if (responseData?.token) {
      setAuthToken(responseData.token);
    }

    return responseData;
  } catch (error) {
    console.error('Error Fetch Login:', error.message);
    throw error;
  }
};
