const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const logout = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/employee/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Logout failed: ${response.statusText}`);
        }

        return response;

    } catch (error) {
        console.error("Error Fetch Logout:", error.message);
        throw error;
    }
};
