import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAnime } from '../services/animeService';
import { searchExternalAnimes, formatAnimeFromJikan } from '../services/jikanService';
import '../styles/AnimeForm.css';

const AddAnime = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [searching, setSearching] = useState(false);
    const [hasSelectedAnime, setHasSelectedAnime] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        coverImage: '',
        status: 'A voir',
        currentEpisode: 0,
        totalEpisodes: '',
        currentSeason: 1,
        totalSeasons: 1,
        rating: '',
        genre: '',
        notes: ''
    });

    // Recherche en temps réel quand l'utilisateur tape
    useEffect(() => {
        // Ne pas chercher si un anime a été sélectionné
        if (hasSelectedAnime) return;

        const delaySearch = setTimeout(() => {
            if (formData.title.trim().length > 2) {
                handleSearch(formData.title);
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 500); // Attendre 500ms après que l'utilisateur arrête de taper

        return () => clearTimeout(delaySearch);
    }, [formData.title, hasSelectedAnime]);

    // Rechercher des animes via l'API
    const handleSearch = async (query) => {
        setSearching(true);

        try {
            const response = await searchExternalAnimes(query);
            setSearchResults(response.data || []);
            setShowResults(true);
        } catch (err) {
            console.error('Erreur lors de la recherche:', err);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    // Sélectionner un anime depuis les résultats
    const handleSelectAnime = (anime) => {
        const formatted = formatAnimeFromJikan(anime);
        setFormData({
            ...formData,
            title: formatted.title,
            coverImage: formatted.coverImage,
            totalEpisodes: formatted.totalEpisodes || '',
            rating: formatted.rating || '',
            genre: formatted.genre.join(', '),
            notes: formatted.notes || ''
        });
        setShowResults(false);
        setSearchResults([]);
        setHasSelectedAnime(true); // Empêcher les recherches automatiques
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Si l'utilisateur modifie le titre après une sélection, réactiver la recherche
        if (name === 'title' && hasSelectedAnime) {
            setHasSelectedAnime(false);
        }

        // Si le statut passe à "Terminé", mettre l'épisode actuel = total
        if (name === 'status' && value === 'Terminé') {
            setFormData({
                ...formData,
                [name]: value,
                currentEpisode: formData.totalEpisodes || formData.currentEpisode
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.title.trim()) {
            setError('Le titre est requis');
            setLoading(false);
            return;
        }

        try {
            const animeData = {
                title: formData.title.trim(),
                coverImage: formData.coverImage.trim() || null,
                status: formData.status,
                currentEpisode: parseInt(formData.currentEpisode) || 0,
                totalEpisodes: formData.totalEpisodes ? parseInt(formData.totalEpisodes) : null,
                currentSeason: parseInt(formData.currentSeason) || 1,
                totalSeasons: parseInt(formData.totalSeasons) || 1,
                rating: formData.rating ? parseFloat(formData.rating) : null,
                genre: formData.genre ? formData.genre.split(',').map(g => g.trim()) : [],
                notes: formData.notes.trim()
            };

            await createAnime(animeData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'ajout de l\'anime');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-page">
            <div className="form-container">
                <div className="form-header">
                    <h1>🎌 Ajouter un anime</h1>
                    <button onClick={() => navigate('/')} className="btn-back">
                        ← Retour
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="anime-form">
                    <div className="form-row">
                        <div className="form-group search-group">
                            <label htmlFor="title">Titre * (tapez pour rechercher)</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Ex: One Piece, Naruto..."
                                required
                                disabled={loading}
                                autoComplete="off"
                            />

                            {/* Résultats de recherche en dropdown */}
                            {showResults && searchResults.length > 0 && (
                                <div className="search-dropdown">
                                    {searching && <div className="dropdown-loading">Recherche...</div>}
                                    {searchResults.slice(0, 5).map((anime) => (
                                        <div
                                            key={anime.mal_id}
                                            className="dropdown-item"
                                            onClick={() => handleSelectAnime(anime)}
                                        >
                                            <img
                                                src={anime.images?.jpg?.small_image_url}
                                                alt={anime.title}
                                                className="dropdown-image"
                                            />
                                            <div className="dropdown-info">
                                                <div className="dropdown-title">{anime.title}</div>
                                                <div className="dropdown-meta">
                                                    {anime.type} • {anime.episodes || '?'} ép.
                                                    {anime.score && ` • ⭐ ${anime.score}`}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="status">Statut</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="A voir">À voir</option>
                                <option value="En cours">En cours</option>
                                <option value="Terminé">Terminé</option>
                                <option value="En pause">En pause</option>
                                <option value="Abandonné">Abandonné</option>
                            </select>
                        </div>
                    </div>




                    <div className="form-group">
                        <label htmlFor="notes">Notes personnelles</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Vos impressions, commentaires..."
                            disabled={loading}
                            autoComplete="off"
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="btn-secondary"
                            disabled={loading}
                        >
                            Annuler
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Ajout en cours...' : 'Ajouter l\'anime'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAnime;