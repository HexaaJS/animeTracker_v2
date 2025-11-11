import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../config/axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState(localStorage.getItem('username'));
    const [loading, setLoading] = useState(true);

    // Vérifier si l'utilisateur existe au chargement
    useEffect(() => {
        const initAuth = async () => {
            if (username) {
                try {
                    const response = await axios.get(`/api/auth/profile/${username}`);
                    setUser(response.data.data);
                } catch (error) {
                    console.error('Erreur lors de la récupération du profil:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [username]);

    // INSCRIPTION
    const register = async (userData) => {
        try {
            const response = await axios.post('/api/auth/register', userData);
            const user = response.data.data;

            localStorage.setItem('username', user.username);
            setUsername(user.username);
            setUser(user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de l\'inscription'
            };
        }
    };

    // CONNEXION
    const login = async (credentials) => {
        try {
            const response = await axios.post('/api/auth/login', credentials);
            const user = response.data.data;

            localStorage.setItem('username', user.username);
            setUsername(user.username);
            setUser(user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la connexion'
            };
        }
    };

    // DÉCONNEXION
    const logout = () => {
        localStorage.removeItem('username');
        setUsername(null);
        setUser(null);
    };

    const value = {
        user,
        username,
        register,
        login,
        logout,
        loading,
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};