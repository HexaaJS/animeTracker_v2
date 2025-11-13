import api from './api';

const animeService = {
  // Récupérer tous les animes de l'utilisateur
  getAnimes: async () => {
    const response = await api.get('/api/animes');
    return response.data;
  },

  // Récupérer un anime par ID
  getAnimeById: async (id) => {
    const response = await api.get(`/api/animes/${id}`);
    return response.data;
  },

  // Ajouter un anime
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

  // Mettre à jour le statut d'un anime
  updateStatus: async (id, status) => {
    const response = await api.patch(`/api/animes/${id}/status`, { status });
    return response.data;
  },

  // Mettre à jour la progression
  updateProgress: async (id, currentEpisode, totalEpisodes) => {
    const response = await api.patch(`/api/animes/${id}/progress`, {
      currentEpisode,
      totalEpisodes
    });
    return response.data;
  }
};

export default animeService;