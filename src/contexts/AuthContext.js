import { createContext } from 'react';

const initialState = {
  isAuthenticated: false,
  profile: null,
};

export const LoginContext = createContext(initialState);
export { initialState };
