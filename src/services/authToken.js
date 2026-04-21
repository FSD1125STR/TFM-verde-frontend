const TOKEN_STORAGE_KEY = 'auth_token';

export const getAuthToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

export const setAuthToken = (token) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
};
