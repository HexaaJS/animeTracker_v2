const express = require('express');
const router = express.Router();
const {
    createAnime,
    getAnimes,
    getAnimeById,
    updateAnime,
    deleteAnime,
    updateProgress,
    getStats,
    searchAnimes
} = require('../controllers/animeController');
const authMiddleware = require('../middleware/auth');

// Toutes les routes sont protégées par authentification
router.use(authMiddleware);

// Routes principales
router.post('/', createAnime);
router.get('/', getAnimes);
router.get('/stats', getStats);
router.get('/search', searchAnimes);
router.get('/:id', getAnimeById);
router.put('/:id', updateAnime);
router.delete('/:id', deleteAnime);
router.patch('/:id/progress', updateProgress);

module.exports = router;