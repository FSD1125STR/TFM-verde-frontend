import { createContext, useEffect, useState } from "react";
import { fetchProfileEmployee } from "../services/fetchProfileEmployee.js";
import { logout } from "../services/LogoutApi.js";


const initialState = {
    isAuthenticated: false,
    profile: null
}

export const LoginContext = createContext(initialState);

export const LoginProvider = ({ children }) => {

    const [isAuthenticated, setIsAuthenticated] = useState(initialState.isAuthenticated);
    const [profile, setProfile] = useState(initialState.profile);
    const [error, setError] = useState('');

    const getEmployeeProfile = async () => {
        setError('');
        try {
            const profileData = await fetchProfileEmployee();
            if (profileData) {
                setProfile(profileData);
                setIsAuthenticated(true);
            } else {
                setProfile(null);
                setIsAuthenticated(false);
            }

        } catch (error) {
            setProfile(null);
            setIsAuthenticated(false);
            setError(error.message);
        }
    }

    useEffect(() => {
        getEmployeeProfile();

    }, []);

    const logoutEmployee = async () => {
        setError('');
        try {
            await logout();
            setProfile(null);
            setIsAuthenticated(false);
            navigate('/login');
        } catch (error) {
            console.error("Logout Error:", error.message);
            setError(error.message);
        }
    }

    return (
        <LoginContext.Provider value={{
            isAuthenticated,
            setIsAuthenticated,
            getEmployeeProfile,
            logoutEmployee,
            profile,
            error,
        }}>
            {children}
        </LoginContext.Provider>
    )
}
