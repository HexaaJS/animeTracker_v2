import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllAnimes, deleteAnime, updateProgress, updateAnime } from '../services/animeService';
import ProgressBar from '../components/ProgressBar';
import '../styles/Dashboard.css';
import { Edit, Pause, X, Trash2, Search } from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [animes, setAnimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

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


    const handleAbandon = async (id) => {
        try {
            const response = await updateAnime(id, { status: 'Abandonné' });
            setAnimes(animes.map(anime =>
                anime._id === id ? response.data : anime
            ));
        } catch (error) {
            console.error('Erreur lors de l\'abandon:', error);
            alert('Erreur lors de l\'abandon');
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

    const handlePause = async (id) => {
        try {
            const response = await updateAnime(id, { status: 'En pause' });
            setAnimes(animes.map(anime =>
                anime._id === id ? response.data : anime
            ));
        } catch (error) {
            console.error('Erreur lors de la mise en pause:', error);
            alert('Erreur lors de la mise en pause');
        }
    };

    const handleProgressUpdate = async (id, currentEpisode) => {
        try {
            // 1) Mettre à jour la progression
            const response = await updateProgress(id, { currentEpisode: parseInt(currentEpisode) });
            const updated = response.data;

            // 2) Calculer le statut cible selon la progression
            const total = Number(updated.totalEpisodes) || 0;
            const cur = Number(updated.currentEpisode) || 0;

            let targetStatus;
            if (total > 0 && cur >= total) {
                // 100% → Terminé
                targetStatus = 'Terminé';
            } else if (cur === 0) {
                // 0% → A voir
                targetStatus = 'A voir';
            } else if (cur > 0 && cur < total) {
                // Entre 1% et 99% → En cours
                targetStatus = 'En cours';
            } else {
                // Garde le statut actuel si pas de totalEpisodes défini
                targetStatus = updated.status;
            }

            // 3) Mettre à jour le statut si nécessaire
            let finalDoc = updated;
            if (updated.status !== targetStatus) {
                const statusResponse = await updateAnime(id, { status: targetStatus });
                finalDoc = statusResponse.data;
            }

            // 4) Mettre à jour le state avec la dernière version
            setAnimes(animes.map(anime =>
                anime._id === id ? finalDoc : anime
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
            case 'En cours':
                return getComputedStyle(document.documentElement).getPropertyValue('--gradient').trim() || 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)';
            case 'Terminé':
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
                        {user?.username}
                    </button>
                </div>
            </header>

            {/* Filtres et recherche */}
            <div className="dashboard-controls">
                <div className="filters">
                    <button
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                        data-status="all"
                    >
                        Tous
                    </button>
                    <button
                        className={filter === 'En cours' ? 'active' : ''}
                        onClick={() => setFilter('En cours')}
                        data-status="En cours"
                    >
                        En cours
                    </button>
                    <button
                        className={filter === 'A voir' ? 'active' : ''}
                        onClick={() => setFilter('A voir')}
                        data-status="A voir"
                    >
                        À voir
                    </button>
                    <button
                        className={filter === 'Terminé' ? 'active' : ''}
                        onClick={() => setFilter('Terminé')}
                        data-status="Terminé"
                    >
                        Terminé
                    </button>
                    <button
                        className={filter === 'En pause' ? 'active' : ''}
                        onClick={() => setFilter('En pause')}
                        data-status="En pause"
                    >
                        En pause
                    </button>
                    <button
                        className={filter === 'Abandonné' ? 'active' : ''}
                        onClick={() => setFilter('Abandonné')}
                        data-status="Abandonné"
                    >
                        Abandonné
                    </button>
                </div>

                <div className="search-box">
                    <Search color='gray' size={16} />
                    <input
                        type="text"
                        placeholder="Rechercher un anime..."
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
                                <div className="anime-card-inner">
                                    {anime.coverImage && (
                                        <>
                                            <div
                                                className="anime-bg-blur"
                                                style={{ backgroundImage: `url(${anime.coverImage})` }}
                                            ></div>

                                            <img src={anime.coverImage} alt={anime.title} className="anime-cover" />
                                        </>
                                    )}

                                    <div className="anime-content">
                                        <h3>{anime.title}</h3>
                                        <div
                                            className="anime-status"
                                            style={{ background: getStatusColor(anime.status), color: '#fff' }}
                                        >
                                            {anime.status}
                                        </div>

                                        {anime.notes && <div className="anime-notes"><em>{anime.notes}</em></div>}

                                        <ProgressBar
                                            currentEpisode={anime.currentEpisode}
                                            totalEpisodes={anime.totalEpisodes}
                                            onUpdate={handleProgressUpdate}
                                            animeId={anime._id}
                                        />

                                        <div className="anime-actions">
                                            <button
                                                className="btn-edit"
                                                onClick={() => navigate(`/edit-anime/${anime._id}`)}
                                                title="Modifier"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                className="btn-pause"
                                                onClick={() => handlePause(anime._id)}
                                                title="Mettre en pause"
                                            >
                                                <Pause size={18} />
                                            </button>
                                            <button
                                                className="btn-abandon"
                                                onClick={() => handleAbandon(anime._id)}
                                                title="Abandonner"
                                            >
                                                <X size={18} />
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(anime._id)}
                                                title="Supprimer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
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