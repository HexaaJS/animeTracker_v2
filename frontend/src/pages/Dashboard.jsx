import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllAnimes, deleteAnime, updateProgress } from '../services/animeService';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [animes, setAnimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Charger les animes au montage
    useEffect(() => {
        fetchAnimes();
    }, [filter]);

    const fetchAnimes = async () => {
        try {
            setLoading(true);
            const filters = filter !== 'all' ? { status: filter } : {};
            const response = await getAllAnimes(filters);
            setAnimes(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des animes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet anime ?')) {
            try {
                await deleteAnime(id);
                setAnimes(animes.filter(anime => anime._id !== id));
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                alert('Erreur lors de la suppression');
            }
        }
    };

    const handleProgressUpdate = async (id, currentEpisode) => {
        try {
            const response = await updateProgress(id, { currentEpisode: parseInt(currentEpisode) });
            setAnimes(animes.map(anime =>
                anime._id === id ? response.data : anime
            ));
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
        }
    };

    const filteredAnimes = animes.filter(anime =>
        anime.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'En cours': return '#4CAF50';
            case 'Terminé': return '#2196F3';
            case 'A voir': return '#FF9800';
            case 'En pause': return '#9E9E9E';
            case 'Abandonné': return '#F44336';
            default: return '#666';
        }
    };

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <h1>🎌 Anime Tracker</h1>
                <div className="header-right">
                    <span className="username">Bonjour, {user?.username} !</span>
                    <button onClick={logout} className="btn-logout">Déconnexion</button>
                </div>
            </header>

            {/* Filtres et recherche */}
            <div className="dashboard-controls">
                <div className="filters">
                    <button
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                    >
                        Tous
                    </button>
                    <button
                        className={filter === 'En cours' ? 'active' : ''}
                        onClick={() => setFilter('En cours')}
                    >
                        En cours
                    </button>
                    <button
                        className={filter === 'A voir' ? 'active' : ''}
                        onClick={() => setFilter('A voir')}
                    >
                        À voir
                    </button>
                    <button
                        className={filter === 'Terminé' ? 'active' : ''}
                        onClick={() => setFilter('Terminé')}
                    >
                        Terminé
                    </button>
                    <button
                        className={filter === 'En pause' ? 'active' : ''}
                        onClick={() => setFilter('En pause')}
                    >
                        En pause
                    </button>
                </div>

                <div className="search-box">
                    <input
                        type="text"
                        placeholder="🔍 Rechercher un anime..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button className="btn-add" onClick={() => alert('Fonctionnalité à venir !')}>
                    + Ajouter un anime
                </button>
            </div>

            {/* Liste des animes */}
            <div className="animes-container">
                {loading ? (
                    <div className="loading">Chargement...</div>
                ) : filteredAnimes.length === 0 ? (
                    <div className="empty-state">
                        <p>Aucun anime trouvé</p>
                        <button className="btn-primary" onClick={() => alert('Fonctionnalité à venir !')}>
                            Ajouter votre premier anime
                        </button>
                    </div>
                ) : (
                    <div className="animes-grid">
                        {filteredAnimes.map((anime) => (
                            <div key={anime._id} className="anime-card">
                                {anime.coverImage && (
                                    <img src={anime.coverImage} alt={anime.title} className="anime-cover" />
                                )}

                                <div className="anime-content">
                                    <h3>{anime.title}</h3>

                                    <div className="anime-status" style={{ backgroundColor: getStatusColor(anime.status) }}>
                                        {anime.status}
                                    </div>

                                    <div className="anime-progress">
                                        <p>
                                            <strong>Progression:</strong> {anime.currentEpisode}
                                            {anime.totalEpisodes && `/${anime.totalEpisodes}`} épisodes
                                        </p>
                                        <p>
                                            <strong>Saison:</strong> {anime.currentSeason}
                                            {anime.totalSeasons && `/${anime.totalSeasons}`}
                                        </p>
                                    </div>

                                    {anime.rating && (
                                        <div className="anime-rating">
                                            ⭐ {anime.rating}/10
                                        </div>
                                    )}

                                    {anime.notes && (
                                        <div className="anime-notes">
                                            <em>{anime.notes}</em>
                                        </div>
                                    )}

                                    <div className="anime-actions">
                                        <input
                                            type="number"
                                            min="0"
                                            max={anime.totalEpisodes || 9999}
                                            value={anime.currentEpisode}
                                            onChange={(e) => handleProgressUpdate(anime._id, e.target.value)}
                                            className="episode-input"
                                        />
                                        <button
                                            className="btn-edit"
                                            onClick={() => alert('Fonctionnalité à venir !')}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(anime._id)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;