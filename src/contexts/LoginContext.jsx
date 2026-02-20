import { createContext, useEffect, useState } from "react";
import { fetchProfileEmployee } from "../services/fetchProfileEmployee.js";


const initialState = {
    isLogginIn: false,
    profile: null
}

export const LoginContext = createContext(initialState);

export const LoginProvider = ({ children }) => {

    const [isLogginIn, setIsLogginIn] = useState(initialState.isLogginIn);
    const [profile, setProfile] = useState(initialState.profile);
    const [error, setError] = useState('');

    const getEmployeeProfile = async () => {
        setError('');
        try {
            const profileData = await fetchProfileEmployee();
            setProfile(profileData);
            setIsLogginIn(true);
        } catch (error) {
            setProfile(null);
            setIsLogginIn(false);
            setError(error.message);
        }
    }

    useEffect(() => {
        getEmployeeProfile();

    }, []);

    return (
        <LoginContext.Provider value={{
            isLogginIn,
            setIsLogginIn,
            getEmployeeProfile,
            profile,
            error,
        }}>
            {children}
        </LoginContext.Provider>
    )
}