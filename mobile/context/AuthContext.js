import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

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
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur existe au chargement
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
          const response = await api.get(`/api/auth/profile/${storedUsername}`);
          setUser(response.data.data);
        }
      } catch (error) {
        console.error('Erreur init auth:', error);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // INSCRIPTION
  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      const newUser = response.data.data;

      await AsyncStorage.setItem('username', newUser.username);
      setUsername(newUser.username);
      setUser(newUser);

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
      const response = await api.post('/api/auth/login', credentials);
      const userData = response.data.data;

      await AsyncStorage.setItem('username', userData.username);
      setUsername(userData.username);
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la connexion'
      };
    }
  };

  // DÉCONNEXION
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('username');
      setUsername(null);
      setUser(null);
    } catch (error) {
      console.error('Erreur logout:', error);
    }
  };

  // Rafraîchir le profil
  const refreshUser = async () => {
    if (username) {
      try {
        const response = await api.get(`/api/auth/profile/${username}`);
        setUser(response.data.data);
      } catch (error) {
        console.error('Erreur refresh user:', error);
      }
    }
  };

  const value = {
    user,
    username,
    register,
    login,
    logout,
    refreshUser,
    loading,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};