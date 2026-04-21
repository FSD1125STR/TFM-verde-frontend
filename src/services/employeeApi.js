import { getAuthHeaders } from './authToken.js';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const getEmployees = async () => {
  const response = await fetch(`${API_BASE_URL}/employee/employees`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Error al cargar empleados');
  }

  return responseData.employees ?? [];
};

export const createEmployee = async (employeeData) => {
  const response = await fetch(`${API_BASE_URL}/employee`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(employeeData),
    credentials: 'include',
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Error al crear empleado');
  }

  return responseData;
};

export const deleteEmployee = async (employeeId) => {
  const response = await fetch(`${API_BASE_URL}/employee/${employeeId}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Error al eliminar empleado');
  }

  return responseData;
};

export const updateEmployee = async (employeeId, employeeData) => {
  const response = await fetch(`${API_BASE_URL}/employee/${employeeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(employeeData),
    credentials: 'include',
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Error al editar empleado');
  }

  return responseData;
};
