import axios from 'axios';

const API_URL = '/api/animes';

// Fonction pour récupérer le username
const getAuthHeader = () => {
    const username = localStorage.getItem('username');
    return { 'X-Username': username };
};

// Obtenir tous les animes
export const getAllAnimes = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(`${API_URL}${params ? `?${params}` : ''}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

// Obtenir un anime par ID
export const getAnimeById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

// Créer un anime
export const createAnime = async (animeData) => {
    const response = await axios.post(API_URL, animeData, {
        headers: getAuthHeader()
    });
    return response.data;
};

// Mettre à jour un anime
export const updateAnime = async (id, animeData) => {
    const response = await axios.put(`${API_URL}/${id}`, animeData, {
        headers: getAuthHeader()
    });
    return response.data;
};

// Supprimer un anime
export const deleteAnime = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

// Mettre à jour la progression
export const updateProgress = async (id, progressData) => {
    const response = await axios.patch(`${API_URL}/${id}/progress`, progressData, {
        headers: getAuthHeader()
    });
    return response.data;
};

// Obtenir les statistiques
export const getStats = async () => {
    const response = await axios.get(`${API_URL}/stats`, {
        headers: getAuthHeader()
    });
    return response.data;
};

// Rechercher des animes
export const searchAnimes = async (query) => {
    const response = await axios.get(`${API_URL}/search?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

// Obtenir tous les animes pour les stats (sans pagination)
export const getAllAnimesForStats = async () => {
    const response = await axios.get(`${API_URL}`, {
        headers: getAuthHeader()
    });
    return response.data;
};