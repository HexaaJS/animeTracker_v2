import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getAllAnimesForStats } from '../services/animeService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import '../styles/Profile.css';

const Profile = () => {
    const { user, logout } = useAuth();
    const { currentTheme, changeTheme, themes } = useTheme();
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
        { name: 'En cours', value: stats.enCours, color: '#4CAF50' },
        { name: 'Terminé', value: stats.termine, color: '#2196F3' },
        { name: 'À voir', value: stats.aVoir, color: '#FF9800' },
        { name: 'En pause', value: stats.enPause, color: '#9E9E9E' },
        { name: 'Abandonné', value: stats.abandonne, color: '#F44336' }
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

                {/* Sélecteur de thème */}
                <div className="theme-section">
                    <h3>Thème</h3>
                    <div className="theme-grid">
                        {Object.entries(themes).map(([key, theme]) => (
                            <div
                                key={key}
                                className={`theme-card ${currentTheme === key ? 'active' : ''}`}
                                onClick={() => changeTheme(key)}
                            >
                                <div
                                    className="theme-preview"
                                    style={{ background: theme.gradient }}
                                />
                                <div className="theme-info">
                                    <span className="theme-emoji">{theme.emoji}</span>
                                    <span className="theme-name">{theme.name}</span>
                                </div>
                            </div>
                        ))}
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
                </div>

                {/* Graphiques */}
                <div className="charts-container">
                    {/* Graphique en anneau - Statuts */}
                    <div className="chart-card">
                        <h3>Répartition par statut</h3>
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
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
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
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
                                            backgroundColor: status.color
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