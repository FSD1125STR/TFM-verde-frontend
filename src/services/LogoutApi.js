const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
import { clearAuthToken, getAuthHeaders } from './authToken.js';

export const logout = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/employee/logout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Logout failed: ${response.statusText}`);
        }

        clearAuthToken();
        return response;

    } catch (error) {
        console.error("Error Fetch Logout:", error.message);
        throw error;
    }
};
