const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

    export const getRoles = async () => {
    const response = await fetch(`${API_BASE_URL}/rol`, {
        method: "GET",
        headers: { Accept: "application/json" },
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(responseData.message || "Error al cargar roles");
    }

    return responseData;
};