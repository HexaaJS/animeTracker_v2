import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL de ton API
const API_URL = 'https://api.graphikai.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le username dans les headers
api.interceptors.request.use(
  async (config) => {
    try {
      const username = await AsyncStorage.getItem('username');
      if (username) {
        config.headers['X-Username'] = username;
      }
    } catch (error) {
      console.error('Erreur lecture username:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Erreur API:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Pas de réponse du serveur');
    } else {
      console.error('Erreur:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;