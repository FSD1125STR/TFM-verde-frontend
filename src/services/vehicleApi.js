import { getAuthHeaders } from './authToken.js';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const getVehicles = async () => {
  const response = await fetch(`${API_BASE_URL}/vehicle`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Error al cargar vehículos');
  }

  return responseData.vehicles ?? [];
};

export const getVehicleById = async (vehicleId) => {
  const response = await fetch(`${API_BASE_URL}/vehicle/${vehicleId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Error al cargar vehículo');
  }

  return responseData.vehicle;
};

export const createVehicle = async (vehicleData) => {
  const response = await fetch(`${API_BASE_URL}/vehicle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(vehicleData),
    credentials: 'include',
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Error al crear vehículo');
  }

  return responseData.vehicle;
};

export const updateVehicle = async (vehicleId, vehicleData) => {
  const response = await fetch(`${API_BASE_URL}/vehicle/${vehicleId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(vehicleData),
    credentials: 'include',
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Error al actualizar vehículo');
  }

  return responseData.vehicle;
};

export const deleteVehicle = async (vehicleId) => {
  const response = await fetch(`${API_BASE_URL}/vehicle/${vehicleId}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Error al eliminar vehículo');
  }

  return responseData;
};
