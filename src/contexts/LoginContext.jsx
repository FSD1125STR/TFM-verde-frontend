import { createContext, useEffect, useState } from "react";
import { fetchProfileEmployee } from "../services/fetchProfileEmployee.js";


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
            setProfile(profileData);
            setIsAuthenticated(true);
        } catch (error) {
            setProfile(null);
            setIsAuthenticated(false);
            setError(error.message);
        }
    }

    useEffect(() => {
        getEmployeeProfile();

    }, []);

    return (
        <LoginContext.Provider value={{
            isAuthenticated,
            setIsAuthenticated,
            getEmployeeProfile,
            profile,
            error,
        }}>
            {children}
        </LoginContext.Provider>
    )
}