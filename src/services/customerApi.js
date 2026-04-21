import { getAuthHeaders } from './authToken.js';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const getCustomers = async () => {
  const response = await fetch(`${API_BASE_URL}/customer`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Error al cargar clientes');
  }

  return responseData.customers ?? [];
};

export const createCustomer = async (customerData) => {
  const response = await fetch(`${API_BASE_URL}/customer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(customerData),
    credentials: 'include',
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Error al crear cliente');
  }

  return responseData.customer;
};

export const updateCustomer = async (customerId, customerData) => {
  const response = await fetch(`${API_BASE_URL}/customer/${customerId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(customerData),
    credentials: 'include',
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Error al editar cliente');
  }

  return responseData.customer;
};

export const deleteCustomer = async (customerId) => {
  const response = await fetch(`${API_BASE_URL}/customer/${customerId}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Error al eliminar cliente');
  }

  return responseData;
};
