const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Le titre est requis'],
        trim: true
    },
    coverImage: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['A voir', 'En cours', 'Terminé', 'Abandonné', 'En pause'],
        default: 'A voir'
    },
    currentEpisode: {
        type: Number,
        default: 0,
        min: 0
    },
    totalEpisodes: {
        type: Number,
        default: null
    },
    currentSeason: {
        type: Number,
        default: 1,
        min: 1
    },
    totalSeasons: {
        type: Number,
        default: 1,
        min: 1
    },
    rating: {
        type: Number,
        min: 0,
        max: 10,
        default: null
    },
    genre: [{
        type: String,
        trim: true
    }],
    notes: {
        type: String,
        default: ''
    },
    startDate: {
        type: Date,
        default: null
    },
    endDate: {
        type: Date,
        default: null
    },
    favorite: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index pour optimiser les recherches
animeSchema.index({ user: 1, status: 1 });
animeSchema.index({ user: 1, title: 'text' });

module.exports = mongoose.model('Anime', animeSchema);