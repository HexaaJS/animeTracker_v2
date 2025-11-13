import axios from 'axios';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

const jikanService = {
  // Rechercher des animes
  searchAnimes: async (query, page = 1) => {
    try {
      const response = await axios.get(`${JIKAN_BASE_URL}/anime`, {
        params: {
          q: query,
          page,
          limit: 20,
          sfw: true
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur recherche Jikan:', error);
      throw error;
    }
  },

  // Récupérer les détails d'un anime
  getAnimeDetails: async (malId) => {
    try {
      const response = await axios.get(`${JIKAN_BASE_URL}/anime/${malId}/full`);
      return response.data;
    } catch (error) {
      console.error('Erreur détails Jikan:', error);
      throw error;
    }
  },

  // Top animes
  getTopAnimes: async (page = 1) => {
    try {
      const response = await axios.get(`${JIKAN_BASE_URL}/top/anime`, {
        params: {
          page,
          limit: 20
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur top Jikan:', error);
      throw error;
    }
  },

  // Animes de la saison
  getSeasonAnimes: async () => {
    try {
      const response = await axios.get(`${JIKAN_BASE_URL}/seasons/now`);
      return response.data;
    } catch (error) {
      console.error('Erreur saison Jikan:', error);
      throw error;
    }
  }
};

export default jikanService;