const Anime = require('../models/Anime');

// Create an anime
const createAnime = async (req, res) => {
    try {
        const anime = new Anime({
            user: req.userId,
            ...req.body
        });

        await anime.save();

        res.status(201).json({
            success: true,
            message: 'Anime added successfully',
            data: anime
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating anime'
        });
    }
};

// Get all user's animes
const getAnimes = async (req, res) => {
    try {
        const { status, favorite } = req.query;
        const query = { user: req.userId };

        // Filter by status if provided
        if (status) {
            query.status = status;
        }

        // Filter by favorites if provided
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
            message: error.message || 'Error retrieving animes'
        });
    }
};

// Get anime by ID
const getAnimeById = async (req, res) => {
    try {
        const anime = await Anime.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!anime) {
            return res.status(404).json({
                success: false,
                message: 'Anime not found'
            });
        }

        res.json({
            success: true,
            data: anime
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error retrieving anime'
        });
    }
};

// Update an anime
const updateAnime = async (req, res) => {
    try {
        const anime = await Anime.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!anime) {
            return res.status(404).json({
                success: false,
                message: 'Anime not found'
            });
        }

        Object.assign(anime, req.body);
        await anime.save();

        res.json({
            success: true,
            message: 'Anime updated',
            data: anime
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating anime'
        });
    }
};

// Delete an anime
const deleteAnime = async (req, res) => {
    try {
        const anime = await Anime.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });

        if (!anime) {
            return res.status(404).json({
                success: false,
                message: 'Anime not found'
            });
        }

        res.json({
            success: true,
            message: 'Anime deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error deleting anime'
        });
    }
};

// Update progress
const updateProgress = async (req, res) => {
    try {
        const anime = await Anime.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!anime) {
            return res.status(404).json({
                success: false,
                message: 'Anime not found'
            });
        }

        const { currentEpisode, currentSeason } = req.body;

        if (currentEpisode !== undefined) {
            anime.currentEpisode = currentEpisode;
        }

        if (currentSeason !== undefined) {
            anime.currentSeason = currentSeason;
        }

        // If user has finished all episodes, mark as completed
        if (
            anime.totalEpisodes &&
            anime.currentEpisode >= anime.totalEpisodes &&
            anime.currentSeason >= anime.totalSeasons
        ) {
            anime.status = 'Completed';
            if (!anime.endDate) {
                anime.endDate = new Date();
            }
        } else if (anime.currentEpisode > 0 && anime.status === 'To Watch') {
            anime.status = 'Watching';
            if (!anime.startDate) {
                anime.startDate = new Date();
            }
        }

        await anime.save();

        res.json({
            success: true,
            message: 'Progress updated',
            data: anime
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating progress'
        });
    }
};

// Get statistics
const getStats = async (req, res) => {
    try {
        const animes = await Anime.find({ user: req.userId });

        const stats = {
            total: animes.length,
            toWatch: animes.filter(a => a.status === 'To Watch').length,
            watching: animes.filter(a => a.status === 'Watching').length,
            completed: animes.filter(a => a.status === 'Completed').length,
            dropped: animes.filter(a => a.status === 'Dropped').length,
            onHold: animes.filter(a => a.status === 'On Hold').length,
            favorites: animes.filter(a => a.favorite).length,
            totalEpisodesWatched: animes.reduce((sum, a) => sum + (a.currentEpisode || 0), 0)
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error retrieving statistics'
        });
    }
};

// Search animes
const searchAnimes = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search term required'
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
            message: error.message || 'Error during search'
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