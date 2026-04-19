import { createContext } from "react";

export const initialState = {
  isAuthenticated: false,
  profile: null,
  setIsAuthenticated: () => {},
  getEmployeeProfile: async () => {},
  logoutEmployee: async () => {},
};

export const LoginContext = createContext(initialState);