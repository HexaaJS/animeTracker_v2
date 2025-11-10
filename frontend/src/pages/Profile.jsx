import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllAnimesForStats } from '../services/animeService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import '../styles/Profile.css';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [animes, setAnimes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnimes();
    }, []);

    const fetchAnimes = async () => {
        try {
            const response = await getAllAnimesForStats();
            setAnimes(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des animes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Es-tu sûr de vouloir te déconnecter ?')) {
            logout();
            navigate('/setup');
        }
    };

    const copyId = () => {
        navigator.clipboard.writeText(user.userId);
        alert('ID copié dans le presse-papiers !');
    };

    // juste au-dessus de statusData
    const STATUS_STYLES = {
        'En cours': {
            bg: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            color: '#667eea',
            gradId: 'grad-en-cours',
            stops: ['#667eea', '#764ba2'],
        },
        'Terminé': {
            bg: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
            color: '#16a34a',
            gradId: 'grad-termine',
            stops: ['#22c55e', '#16a34a'],
        },
        'A voir': {
            bg: '#FF9800',
            color: '#FF9800',
        },
        'En pause': {
            bg: '#9E9E9E',
            color: '#9E9E9E',
        },
        'Abandonné': {
            bg: '#F44336',
            color: '#F44336',
        },
    };


    // Calcul des stats
    const stats = {
        total: animes.length,
        enCours: animes.filter(a => a.status === 'En cours').length,
        termine: animes.filter(a => a.status === 'Terminé').length,
        aVoir: animes.filter(a => a.status === 'A voir').length,
        enPause: animes.filter(a => a.status === 'En pause').length,
        abandonne: animes.filter(a => a.status === 'Abandonné').length,
        episodesVus: animes.reduce((sum, a) => sum + (a.currentEpisode || 0), 0),
        moyenneNote: animes.filter(a => a.rating).length > 0
            ? (animes.reduce((sum, a) => sum + (a.rating || 0), 0) / animes.filter(a => a.rating).length).toFixed(1)
            : 0,
        tempsEstime: Math.round(animes.reduce((sum, a) => sum + (a.currentEpisode || 0), 0) * 24 / 60) // 24min par épisode
    };

    // Données pour le graphique en anneau (statuts)
    const statusData = [
        { name: 'En cours', value: stats.enCours, color: STATUS_STYLES['En cours'].color, bg: STATUS_STYLES['En cours'].bg },
        { name: 'Terminé', value: stats.termine, color: STATUS_STYLES['Terminé'].color, bg: STATUS_STYLES['Terminé'].bg },
        { name: 'A voir', value: stats.aVoir, color: STATUS_STYLES['A voir'].color, bg: STATUS_STYLES['A voir'].bg },
        { name: 'En pause', value: stats.enPause, color: STATUS_STYLES['En pause'].color, bg: STATUS_STYLES['En pause'].bg },
        { name: 'Abandonné', value: stats.abandonne, color: STATUS_STYLES['Abandonné'].color, bg: STATUS_STYLES['Abandonné'].bg },
    ].filter(item => item.value > 0);


    // Top 5 genres
    const genresCount = {};
    animes.forEach(anime => {
        anime.genre?.forEach(g => {
            genresCount[g] = (genresCount[g] || 0) + 1;
        });
    });

    const topGenres = Object.entries(genresCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));

    if (loading) {
        return <div className="loading">Chargement...</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-container-large">
                <button onClick={() => navigate('/')} className="btn-back">
                    ← Retour
                </button>

                {/* Header avec avatar et infos */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-header-info">
                        <h1>{user?.username}</h1>
                        <div className="profile-id">
                            <span>ID: {user?.userId}</span>
                            <button onClick={copyId} className="btn-copy-small">
                                copy
                            </button>
                        </div>
                        <p className="member-since">
                            Membre depuis {new Date(user?.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                {/* Stats principales */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Animes totaux</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-value">{stats.episodesVus}</div>
                        <div className="stat-label">Épisodes vus</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-value">{stats.tempsEstime}h</div>
                        <div className="stat-label">Temps passé</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-value">{stats.moyenneNote || 'N/A'}</div>
                        <div className="stat-label">Note moyenne</div>
                    </div>
                </div>

                {/* Graphiques */}
                <div className="charts-container">
                    {/* Graphique en anneau - Statuts */}
                    <div className="chart-card">
                        <h3>Répartition par statut</h3>
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <defs>
                                        <linearGradient id="grad-en-cours" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#667eea" />
                                            <stop offset="100%" stopColor="#764ba2" />
                                        </linearGradient>
                                        <linearGradient id="grad-termine" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#22c55e" />
                                            <stop offset="100%" stopColor="#16a34a" />
                                        </linearGradient>
                                    </defs>

                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {statusData.map((entry, index) => {
                                            const fill =
                                                entry.name === 'En cours' ? 'url(#grad-en-cours)' :
                                                    entry.name === 'Terminé' ? 'url(#grad-termine)' :
                                                        entry.color;
                                            return <Cell key={`cell-${index}`} fill={fill} />;
                                        })}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>

                        ) : (
                            <p className="no-data">Aucune donnée disponible</p>
                        )}
                    </div>

                    {/* Top genres */}
                    <div className="chart-card">
                        <h3>Top 5 genres préférés</h3>
                        {topGenres.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topGenres}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#667eea" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="no-data">Aucun genre enregistré</p>
                        )}
                    </div>
                </div>

                {/* Détails par statut */}
                <div className="status-details">
                    <h3>Détails par statut</h3>
                    <div className="status-bars">
                        {statusData.map((status) => (
                            <div key={status.name} className="status-bar-item">
                                <div className="status-bar-header">
                                    <span className="status-name">{status.name}</span>
                                    <span className="status-count">{status.value}</span>
                                </div>
                                <div className="status-bar-container">
                                    <div
                                        className="status-bar-fill"
                                        style={{
                                            width: `${(status.value / stats.total) * 100}%`,
                                            background: status.bg, // ✅ gradient ou couleur solide
                                        }}
                                    />

                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bouton déconnexion */}
                <button onClick={handleLogout} className="btn-logout-profile">
                    Déconnexion
                </button>
            </div>
        </div>
    );
};

export default Profile;