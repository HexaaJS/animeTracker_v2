import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllAnimes, deleteAnime, updateProgress, updateAnime } from '../services/animeService';
import ProgressBar from '../components/ProgressBar';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [animes, setAnimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Charger les animes au montage et quand le filtre change
    useEffect(() => {
        fetchAnimes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                setAnimes(prev => prev.filter(anime => anime._id !== id));
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                alert('Erreur lors de la suppression');
            }
        }
    };

    // Patch complet : toujours calculer le statut cible après la MAJ serveur
    const handleProgressUpdate = async (id, nextEpisode) => {
        try {
            // 1) Envoyer la progression au serveur
            const { data: updated } = await updateProgress(id, { currentEpisode: parseInt(nextEpisode, 10) });
            // "updated" doit contenir { _id, currentEpisode, totalEpisodes, status, ... }

            // 2) Calculer le statut cible
            const total = Number(updated.totalEpisodes) || 0;
            const cur = Number(updated.currentEpisode) || 0;

            let targetStatus;
            if (total > 0 && cur >= total) {
                targetStatus = 'Terminé';
            } else if (cur <= 0) {
                targetStatus = 'A voir';
            } else {
                targetStatus = 'En cours';
            }

            // 3) Mettre à jour le statut si nécessaire
            let finalDoc = updated;
            if (updated.status !== targetStatus) {
                // adapte si ton API attend { status: targetStatus }
                const res = await updateAnime(id, targetStatus);
                finalDoc = res.data;
            }

            // 4) Remplacer dans le state avec la dernière version
            setAnimes(prev => prev.map(a => (a._id === id ? finalDoc : a)));
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            alert('Erreur lors de la mise à jour de la progression');
        }
    };

    const handleEdit = async (id) => {
        navigate('/profile');
    };

    const handlePause = async (id) => {
        // snapshot profond (simple) pour rollback fiable
        const snapshot = JSON.parse(JSON.stringify(animes));
        setAnimes(prev => prev.map(a => (a._id === id ? { ...a, status: 'En pause' } : a)));

        try {
            // adapte si ton API attend { status: 'En pause' }
            const { data } = await updateAnime(id, 'En pause');
            setAnimes(prev => prev.map(a => (a._id === id ? data : a)));
        } catch (e) {
            console.error('Erreur lors de la mise en pause:', e);
            alert('Impossible de mettre en pause pour le moment.');
            setAnimes(snapshot); // rollback
        }
    };

    const filteredAnimes = animes.filter(anime =>
        anime.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Gradients/couleurs par statut (tu peux réutiliser ailleurs)
    const getStatusColor = (status) => {
        switch (status) {
            case 'En cours':
                // violet
                return 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)';
            case 'Terminé':
                // vert
                return 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)';
            case 'A voir':
                return '#FF9800';
            case 'En pause':
                return '#9E9E9E';
            case 'Abandonné':
                return '#F44336';
            default:
                return '#666';
        }
    };

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <h1>Anime Tracker</h1>
                <div className="header-right">
                    <button onClick={() => navigate('/profile')} className="btn-profile">
                        👤 {user?.username}
                    </button>
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

                <button className="btn-add" onClick={() => navigate('/add-anime')}>
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
                        <button className="btn-primary" onClick={() => navigate('/add-anime')}>
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

                                    <div
                                        className="anime-status"
                                        style={{ background: getStatusColor(anime.status), color: '#fff' }}
                                    >
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

                                    <ProgressBar
                                        currentEpisode={anime.currentEpisode}
                                        totalEpisodes={anime.totalEpisodes}
                                        onUpdate={handleProgressUpdate}
                                        animeId={anime._id}
                                    />

                                    <div className="anime-actions">
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEdit(anime._id)}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(anime._id)}
                                        >
                                            🗑️
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handlePause(anime._id)}
                                        >
                                            ⏸️
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
