import api from './api';

const authService = {
  // Inscription
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  // Connexion
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  // Récupérer le profil
  getProfile: async (username) => {
    const response = await api.get(`/api/auth/profile/${username}`);
    return response.data;
  },

  // Mettre à jour le thème
  updateTheme: async (username, theme) => {
    const response = await api.post('/api/auth/update-theme', {
      username,
      theme
    });
    return response.data;
  }
};

export default authService;