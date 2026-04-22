import { getAuthHeaders } from './authToken.js';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...getAuthHeaders(),
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...options,
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(responseData.message || 'Error al procesar el chat');
  }

  return responseData;
};

export const getChatGroups = async () => {
  const response = await request('/chat/groups');
  return response.groups ?? [];
};

export const createChatGroup = async (groupData) =>
  request('/chat/groups', {
    method: 'POST',
    body: JSON.stringify(groupData),
  });

export const updateChatGroup = async (groupId, groupData) =>
  request(`/chat/groups/${groupId}`, {
    method: 'PUT',
    body: JSON.stringify(groupData),
  });

export const deleteChatGroup = async (groupId) =>
  request(`/chat/groups/${groupId}`, {
    method: 'DELETE',
  });
