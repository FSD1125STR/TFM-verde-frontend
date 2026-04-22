const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
import { clearAuthToken, getAuthHeaders } from './authToken.js';


export const fetchProfileEmployee = async () => {
   
    const response = await fetch(`${API_BASE_URL}/employee/profile`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
    });

    if (response.status === 401) {
        clearAuthToken();
        return null;
    }

    const responseData = await response.json();

    if(!response.ok) {
        throw new Error(`${responseData.message}`);
    }

    return responseData;
};   
