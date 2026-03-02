const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";


export const fetchProfileEmployee = async () => {
   
    const response = await fetch(`${API_BASE_URL}/employee/profile`, {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
    });

    if (response.status === 401) return null;

    const responseData = await response.json();

    if(!response.ok) {
        throw new Error(`${responseData.message}`);
    }

    return responseData;
};   