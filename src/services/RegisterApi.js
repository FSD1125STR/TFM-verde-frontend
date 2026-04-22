const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

    export const registerCompany = async (data) => {
    const response = await fetch(`${API_BASE_URL}/company/register`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        },
        body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(responseData.message || "Error en el registro");
    }

    return responseData;
};