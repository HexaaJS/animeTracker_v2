import api from './api';

const animeService = {
  // Récupérer tous les animes de l'utilisateur
  getAnimes: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/api/animes${params ? `?${params}` : ''}`);
    return response.data;
  },

  // Récupérer un anime par ID
  getAnimeById: async (id) => {
    const response = await api.get(`/api/animes/${id}`);
    return response.data;
  },

  // Ajouter un anime (createAnime)
  addAnime: async (animeData) => {
    const response = await api.post('/api/animes', animeData);
    return response.data;
  },

  // Mettre à jour un anime
  updateAnime: async (id, animeData) => {
    const response = await api.put(`/api/animes/${id}`, animeData);
    return response.data;
  },

  // Supprimer un anime
  deleteAnime: async (id) => {
    const response = await api.delete(`/api/animes/${id}`);
    return response.data;
  },

  // Mettre à jour la progression
  updateProgress: async (id, progressData) => {
    const response = await api.patch(`/api/animes/${id}/progress`, progressData);
    return response.data;
  },

  // Obtenir les statistiques
  getStats: async () => {
    const response = await api.get('/api/animes/stats');
    return response.data;
  },

  // Rechercher des animes
  searchAnimes: async (query) => {
    const response = await api.get(`/api/animes/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};

export default animeService;