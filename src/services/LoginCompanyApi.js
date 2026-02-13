const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const loginCompany = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/company/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });
        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || 'Error en el login');
        }
        return responseData;
    } catch (error) {
        console.error('Error en el login:', error);
        throw error;
    }
};