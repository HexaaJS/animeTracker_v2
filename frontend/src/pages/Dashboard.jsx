import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllAnimes, deleteAnime, updateProgress, updateAnime } from '../services/animeService';
import ProgressBar from '../components/ProgressBar';
import '../styles/Dashboard.css';
import { Edit, Pause, X, Trash2, Search, HelpingHand } from 'lucide-react';
import Logo from '../assets/logo.png'

const Dashboard = () => {
    const { user } = useAuth();
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
            console.error('Error loading animes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAbandon = async (id) => {
        try {
            const response = await updateAnime(id, { status: 'Dropped' });
            setAnimes(animes.map(anime =>
                anime._id === id ? response.data : anime
            ));
        } catch (error) {
            console.error('Error dropping anime:', error);
            alert('Error dropping anime');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this anime?')) {
            try {
                await deleteAnime(id);
                setAnimes(animes.filter(anime => anime._id !== id));
            } catch (error) {
                console.error('Error deleting:', error);
                alert('Error deleting anime');
            }
        }
    };

    const handlePause = async (id) => {
        try {
            const response = await updateAnime(id, { status: 'On Hold' });
            setAnimes(animes.map(anime =>
                anime._id === id ? response.data : anime
            ));
        } catch (error) {
            console.error('Error pausing:', error);
            alert('Error pausing anime');
        }
    };

    const handleProgressUpdate = async (id, currentEpisode) => {
        try {
            // 1) Update progress
            const response = await updateProgress(id, { currentEpisode: parseInt(currentEpisode) });
            const updated = response.data;

            // 2) Calculate target status based on progress
            const total = Number(updated.totalEpisodes) || 0;
            const cur = Number(updated.currentEpisode) || 0;

            let targetStatus;
            if (total > 0 && cur >= total) {
                // 100% → Completed
                targetStatus = 'Completed';
            } else if (cur === 0) {
                // 0% → To Watch
                targetStatus = 'To Watch';
            } else if (cur > 0 && cur < total) {
                // Between 1% and 99% → Watching
                targetStatus = 'Watching';
            } else {
                // Keep current status if totalEpisodes not defined
                targetStatus = updated.status;
            }

            // 3) Update status if necessary
            let finalDoc = updated;
            if (updated.status !== targetStatus) {
                const statusResponse = await updateAnime(id, { status: targetStatus });
                finalDoc = statusResponse.data;
            }

            // 4) Update state with latest version
            setAnimes(animes.map(anime =>
                anime._id === id ? finalDoc : anime
            ));
        } catch (error) {
            console.error('Error updating:', error);
        }
    };

    const filteredAnimes = animes.filter(anime =>
        anime.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Watching':
                return getComputedStyle(document.documentElement).getPropertyValue('--gradient').trim() || 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)';
            case 'Completed':
                return 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)';
            case 'To Watch':
                return '#FF9800';
            case 'On Hold':
                return '#9E9E9E';
            case 'Dropped':
                return '#F44336';
            default:
                return '#666';
        }
    };

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <img src={Logo}
                    style={{
                        height: 100,
                        width: 200
                    }}
                />
                <div className="header-right">
                    <button onClick={() => navigate('/profile')} className="btn-profile">
                        {user?.username}
                    </button>
                </div>
            </header>

            {/* Filters and search */}
            <div className="dashboard-controls">
                <div className="filters">
                    <button
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                        data-status="all"
                    >
                        All
                    </button>
                    <button
                        className={filter === 'Watching' ? 'active' : ''}
                        onClick={() => setFilter('Watching')}
                        data-status="Watching"
                    >
                        Watching
                    </button>
                    <button
                        className={filter === 'To Watch' ? 'active' : ''}
                        onClick={() => setFilter('To Watch')}
                        data-status="To Watch"
                    >
                        To Watch
                    </button>
                    <button
                        className={filter === 'Completed' ? 'active' : ''}
                        onClick={() => setFilter('Completed')}
                        data-status="Completed"
                    >
                        Completed
                    </button>
                    <button
                        className={filter === 'On Hold' ? 'active' : ''}
                        onClick={() => setFilter('On Hold')}
                        data-status="On Hold"
                    >
                        On Hold
                    </button>
                    <button
                        className={filter === 'Dropped' ? 'active' : ''}
                        onClick={() => setFilter('Dropped')}
                        data-status="Dropped"
                    >
                        Dropped
                    </button>
                </div>

                <div className="search-box">
                    <Search color='gray' size={16} />
                    <input
                        type="text"
                        placeholder="Search for an anime..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button className="btn-add" onClick={() => navigate('/add-anime')}>
                    + Add Anime
                </button>
            </div>

            {/* Anime list */}
            <div className="animes-container">
                {loading ? (
                    <div className="loading">Loading...</div>
                ) : filteredAnimes.length === 0 ? (
                    <div className="empty-state">
                        <p>No anime found</p>
                        <button className="btn-primary" onClick={() => navigate('/add-anime')}>
                            Add your first anime
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
                                            style={{ background: getStatusColor(anime.status) }}
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
                                                title="Edit"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                className="btn-pause"
                                                onClick={() => handlePause(anime._id)}
                                                title="Put on hold"
                                            >
                                                <Pause size={18} />
                                            </button>
                                            <button
                                                className="btn-abandon"
                                                onClick={() => handleAbandon(anime._id)}
                                                title="Drop"
                                            >
                                                <X size={18} />
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(anime._id)}
                                                title="Delete"
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