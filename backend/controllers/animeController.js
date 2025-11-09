const Anime = require('../models/Anime');

// Créer un anime
const createAnime = async (req, res) => {
    try {
        const anime = new Anime({
            user: req.userId,
            ...req.body
        });

        await anime.save();

        res.status(201).json({
            success: true,
            message: 'Anime ajouté avec succès',
            data: anime
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la création de l\'anime'
        });
    }
};

// Obtenir tous les animes de l'utilisateur
const getAnimes = async (req, res) => {
    try {
        const { status, favorite } = req.query;
        const query = { user: req.userId };

        // Filtrer par statut si fourni
        if (status) {
            query.status = status;
        }

        // Filtrer par favoris si fourni
        if (favorite === 'true') {
            query.favorite = true;
        }

        const animes = await Anime.find(query).sort({ updatedAt: -1 });

        res.json({
            success: true,
            count: animes.length,
            data: animes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la récupération des animes'
        });
    }
};

// Obtenir un anime par ID
const getAnimeById = async (req, res) => {
    try {
        const anime = await Anime.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!anime) {
            return res.status(404).json({
                success: false,
                message: 'Anime non trouvé'
            });
        }

        res.json({
            success: true,
            data: anime
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la récupération de l\'anime'
        });
    }
};

// Mettre à jour un anime
const updateAnime = async (req, res) => {
    try {
        const anime = await Anime.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!anime) {
            return res.status(404).json({
                success: false,
                message: 'Anime non trouvé'
            });
        }

        Object.assign(anime, req.body);
        await anime.save();

        res.json({
            success: true,
            message: 'Anime mis à jour',
            data: anime
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la mise à jour de l\'anime'
        });
    }
};

// Supprimer un anime
const deleteAnime = async (req, res) => {
    try {
        const anime = await Anime.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });

        if (!anime) {
            return res.status(404).json({
                success: false,
                message: 'Anime non trouvé'
            });
        }

        res.json({
            success: true,
            message: 'Anime supprimé avec succès'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la suppression de l\'anime'
        });
    }
};

// Mettre à jour la progression
const updateProgress = async (req, res) => {
    try {
        const anime = await Anime.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!anime) {
            return res.status(404).json({
                success: false,
                message: 'Anime non trouvé'
            });
        }

        const { currentEpisode, currentSeason } = req.body;

        if (currentEpisode !== undefined) {
            anime.currentEpisode = currentEpisode;
        }

        if (currentSeason !== undefined) {
            anime.currentSeason = currentSeason;
        }

        // Si l'utilisateur a fini tous les épisodes, marquer comme terminé
        if (
            anime.totalEpisodes &&
            anime.currentEpisode >= anime.totalEpisodes &&
            anime.currentSeason >= anime.totalSeasons
        ) {
            anime.status = 'Terminé';
            if (!anime.endDate) {
                anime.endDate = new Date();
            }
        } else if (anime.currentEpisode > 0 && anime.status === 'A voir') {
            anime.status = 'En cours';
            if (!anime.startDate) {
                anime.startDate = new Date();
            }
        }

        await anime.save();

        res.json({
            success: true,
            message: 'Progression mise à jour',
            data: anime
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la mise à jour de la progression'
        });
    }
};

// Obtenir les statistiques
const getStats = async (req, res) => {
    try {
        const animes = await Anime.find({ user: req.userId });

        const stats = {
            total: animes.length,
            aVoir: animes.filter(a => a.status === 'A voir').length,
            enCours: animes.filter(a => a.status === 'En cours').length,
            termine: animes.filter(a => a.status === 'Terminé').length,
            abandonne: animes.filter(a => a.status === 'Abandonné').length,
            enPause: animes.filter(a => a.status === 'En pause').length,
            favoris: animes.filter(a => a.favorite).length,
            totalEpisodesVus: animes.reduce((sum, a) => sum + (a.currentEpisode || 0), 0)
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la récupération des statistiques'
        });
    }
};

// Rechercher des animes
const searchAnimes = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Terme de recherche requis'
            });
        }

        const animes = await Anime.find({
            user: req.userId,
            title: { $regex: q, $options: 'i' }
        }).sort({ updatedAt: -1 });

        res.json({
            success: true,
            count: animes.length,
            data: animes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la recherche'
        });
    }
};

module.exports = {
    createAnime,
    getAnimes,
    getAnimeById,
    updateAnime,
    deleteAnime,
    updateProgress,
    getStats,
    searchAnimes
};