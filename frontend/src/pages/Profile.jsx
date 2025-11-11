import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getAllAnimesForStats } from '../services/animeService';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Sector
} from 'recharts';
import '../styles/Profile.css';
import { Crown } from 'lucide-react';
import PremiumModal from '../components/PremiumModal';
import { checkPaymentStatus } from '../services/premiumService';

// Slice actif “zoomé”
const renderActiveShape = (props) => {
    const {
        cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill,
    } = props;

    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 10}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            {/* petit halo */}
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={outerRadius + 10}
                outerRadius={outerRadius + 14}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                opacity={0.2}
            />
        </g>
    );
};

const Profile = () => {
    const { user, logout } = useAuth();
    const { currentTheme, changeTheme, themes } = useTheme();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [animes, setAnimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [enCoursStops, setEnCoursStops] = useState(["#667eea", "#764ba2"]);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    useEffect(() => {
        fetchAnimes();
        checkPaymentStatus();
    }, []);

    const checkPaymentStatus = () => {
        const paymentStatus = searchParams.get('payment');
        if (paymentStatus === 'success') {
            alert('🎉 Paiement réussi ! Premium activé !');
            setSearchParams({}); // Nettoyer l'URL
            window.location.reload(); // Recharger pour mettre à jour isPremium
        } else if (paymentStatus === 'cancelled') {
            alert('❌ Paiement annulé');
            setSearchParams({});
        }
    };

    useEffect(() => {
        // essaie de lire --gradient (ex: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)")
        const cssGrad = getComputedStyle(document.documentElement).getPropertyValue('--gradient')?.trim() || '';
        const matches = cssGrad.match(/#([0-9a-f]{3,8})/gi);
        if (matches && matches.length >= 2) {
            setEnCoursStops([matches[0], matches[1]]);
        }
    }, [currentTheme]);

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
        tempsEstime: Math.round(animes.reduce((sum, a) => sum + (a.currentEpisode || 0), 0) * 24 / 60) // 24min/ep
    };

    // Données pour le graphique (on met des couleurs simples en fallback)
    const statusData = [
        { name: 'En cours', value: stats.enCours, color: enCoursStops[0] },        // remplacé par url(#grad-en-cours)
        { name: 'Terminé', value: stats.termine, color: '#22c55e' },               // remplacé par url(#grad-termine)
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

    // style helper pour les barres "Détails par statut"
    const getBarBackground = (status) => {
        if (status.name === 'En cours') {
            return { backgroundImage: `linear-gradient(90deg, ${enCoursStops[0]} 0%, ${enCoursStops[1]} 100%)` };
        }
        if (status.name === 'Terminé') {
            return { backgroundImage: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' };
        }
        return { backgroundColor: status.color };
    };

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
                    {!user?.isPremium ? (
                        <button className="premium-banner-btn" onClick={() => setShowPremiumModal(true)}>
                            <Crown size={20} />
                            <span>Débloquez 20+ thèmes exclusifs avec Premium</span>
                        </button>
                    ) : (
                        <div className="premium-badge">
                            <Crown size={18} />
                            <span>Premium Actif</span>
                        </div>
                    )}
                    <div className="theme-dropdown">
                        <div className="theme-selected">
                            <div
                                className="theme-preview-small"
                                style={{ background: themes[currentTheme].gradient }}
                            />
                            <span className="theme-current-name">
                                {themes[currentTheme].emoji} {themes[currentTheme].name}
                            </span>
                            <span className="dropdown-arrow">▼</span>
                        </div>

                        <div className="theme-dropdown-menu">
                            {Object.entries(themes).map(([key, theme]) => {
                                const isLocked = theme.isPremium && !user?.isPremium;
                                return (
                                    <div
                                        key={key}
                                        className={`theme-option ${currentTheme === key ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                                        onClick={() => !isLocked && changeTheme(key)}
                                    >
                                        <div
                                            className="theme-preview-small"
                                            style={{ background: theme.gradient, opacity: isLocked ? 0.5 : 1 }}
                                        />
                                        <span className="theme-option-emoji">{theme.emoji}</span>
                                        <span className="theme-option-name">{theme.name}</span>
                                        {isLocked ? (
                                            <span className="lock-icon">🔒</span>
                                        ) : currentTheme === key ? (
                                            <span className="check-mark">✓</span>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
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
                                    {/* Définition des dégradés SVG */}
                                    <defs>
                                        <linearGradient id="grad-en-cours" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor={enCoursStops[0]} />
                                            <stop offset="100%" stopColor={enCoursStops[1]} />
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
                                        // Anim d’arrivée
                                        isAnimationActive
                                        animationDuration={400}
                                        animationEasing="ease-out"
                                        // Hover zoom
                                        activeIndex={activeIndex}
                                        activeShape={renderActiveShape}
                                        onMouseEnter={(_, index) => setActiveIndex(index)}
                                        onMouseLeave={() => setActiveIndex(-1)}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                style={{ cursor: 'pointer' }}
                                                fill={
                                                    entry.name === 'En cours'
                                                        ? 'url(#grad-en-cours)'
                                                        : entry.name === 'Terminé'
                                                            ? 'url(#grad-termine)'
                                                            : entry.color
                                                }
                                            />
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
                    <h3>📋 Détails par statut</h3>
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
                                            ...getBarBackground(status),
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

            <PremiumModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                username={user?.username}
            />

        </div>
    );
};

export default Profile;

