import axios from 'axios';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

// Rechercher des animes
export const searchExternalAnimes = async (query) => {
    try {
        const response = await axios.get(`${JIKAN_BASE_URL}/anime`, {
            params: {
                q: query,
                limit: 10,
                order_by: 'popularity',
                sort: 'asc'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la recherche d\'animes:', error);
        throw error;
    }
};

// Obtenir les détails d'un anime
export const getAnimeDetails = async (malId) => {
    try {
        const response = await axios.get(`${JIKAN_BASE_URL}/anime/${malId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des détails:', error);
        throw error;
    }
};

// Formater les données de l'API pour notre format
export const formatAnimeFromJikan = (jikanAnime) => {
    return {
        title: jikanAnime.title || jikanAnime.title_english || '',
        coverImage: jikanAnime.images?.jpg?.large_image_url || jikanAnime.images?.jpg?.image_url || '',
        totalEpisodes: jikanAnime.episodes || null,
        totalSeasons: 1, // Jikan ne donne pas cette info directement
        rating: jikanAnime.score || null,
        genre: jikanAnime.genres?.map(g => g.name) || [],
        notes: jikanAnime.synopsis || '',
        status: 'A voir', // Par défaut
        currentEpisode: 0,
        currentSeason: 1
    };
};