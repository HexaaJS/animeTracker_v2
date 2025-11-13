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

// Active "zoomed" slice
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
            {/* small halo */}
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
    const [watchingStops, setWatchingStops] = useState(["#667eea", "#764ba2"]);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    useEffect(() => {
        fetchAnimes();
        checkPaymentStatus();
    }, []);

    const checkPaymentStatus = () => {
        const paymentStatus = searchParams.get('payment');
        if (paymentStatus === 'success') {
            alert('🎉 Payment successful! Premium activated!');
            setSearchParams({}); // Clean URL
            window.location.reload(); // Reload to update isPremium
        } else if (paymentStatus === 'cancelled') {
            alert('❌ Payment cancelled');
            setSearchParams({});
        }
    };

    useEffect(() => {
        // try to read --gradient (ex: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)")
        const cssGrad = getComputedStyle(document.documentElement).getPropertyValue('--gradient')?.trim() || '';
        const matches = cssGrad.match(/#([0-9a-f]{3,8})/gi);
        if (matches && matches.length >= 2) {
            setWatchingStops([matches[0], matches[1]]);
        }
    }, [currentTheme]);

    const fetchAnimes = async () => {
        try {
            const response = await getAllAnimesForStats();
            setAnimes(response.data);
        } catch (error) {
            console.error('Error loading animes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            logout();
            navigate('/login');
        }
    };

    const copyId = () => {
        navigator.clipboard.writeText(user.userId);
        alert('ID copied to clipboard!');
    };

    // Stats calculation
    const stats = {
        total: animes.length,
        watching: animes.filter(a => a.status === 'Watching').length,
        completed: animes.filter(a => a.status === 'Completed').length,
        toWatch: animes.filter(a => a.status === 'To Watch').length,
        onHold: animes.filter(a => a.status === 'On Hold').length,
        dropped: animes.filter(a => a.status === 'Dropped').length,
        episodesWatched: animes.reduce((sum, a) => sum + (a.currentEpisode || 0), 0),
        averageRating: animes.filter(a => a.rating).length > 0
            ? (animes.reduce((sum, a) => sum + (a.rating || 0), 0) / animes.filter(a => a.rating).length).toFixed(1)
            : 0,
        estimatedTime: Math.round(animes.reduce((sum, a) => sum + (a.currentEpisode || 0), 0) * 24 / 60) // 24min/ep
    };

    // Data for chart (simple fallback colors)
    const statusData = [
        { name: 'Watching', value: stats.watching, color: watchingStops[0] },        // replaced by url(#grad-watching)
        { name: 'Completed', value: stats.completed, color: '#22c55e' },              // replaced by url(#grad-completed)
        { name: 'To Watch', value: stats.toWatch, color: '#FF9800' },
        { name: 'On Hold', value: stats.onHold, color: '#9E9E9E' },
        { name: 'Dropped', value: stats.dropped, color: '#F44336' }
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
        return <div className="loading">Loading...</div>;
    }

    // style helper for "Details by status" bars
    const getBarBackground = (status) => {
        if (status.name === 'Watching') {
            return { backgroundImage: `linear-gradient(90deg, ${watchingStops[0]} 0%, ${watchingStops[1]} 100%)` };
        }
        if (status.name === 'Completed') {
            return { backgroundImage: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' };
        }
        return { backgroundColor: status.color };
    };

    return (
        <div className="profile-page">
            <div className="profile-container-large">
                <button onClick={() => navigate('/')} className="btn-back">
                    ← Back
                </button>

                {/* Header with avatar and info */}
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
                            Member since {new Date(user?.createdAt).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                {/* Theme selector */}
                <div className="theme-section">
                    <h3>Theme</h3>
                    {!user?.isPremium ? (
                        <button className="premium-banner-btn" onClick={() => setShowPremiumModal(true)}>
                            <Crown size={20} />
                            <span>Unlock 20+ exclusive themes with Premium</span>
                        </button>
                    ) : (
                        <div className="premium-badge">
                            <Crown size={18} />
                            <span>Premium Active</span>
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

                {/* Main stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Animes</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-value">{stats.episodesWatched}</div>
                        <div className="stat-label">Episodes Watched</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-value">{stats.estimatedTime}h</div>
                        <div className="stat-label">Time Spent</div>
                    </div>
                </div>

                {/* Charts */}
                <div className="charts-container">
                    {/* Donut chart - Status */}
                    <div className="chart-card">
                        <h3>Distribution by Status</h3>
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    {/* SVG gradient definitions */}
                                    <defs>
                                        <linearGradient id="grad-watching" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor={watchingStops[0]} />
                                            <stop offset="100%" stopColor={watchingStops[1]} />
                                        </linearGradient>

                                        <linearGradient id="grad-completed" x1="0" y1="0" x2="1" y2="0">
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
                                        // Entry animation
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
                                                    entry.name === 'Watching'
                                                        ? 'url(#grad-watching)'
                                                        : entry.name === 'Completed'
                                                            ? 'url(#grad-completed)'
                                                            : entry.color
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="no-data">No data available</p>
                        )}
                    </div>

                    {/* Top genres */}
                    <div className="chart-card">
                        <h3>Top 5 Favorite Genres</h3>
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
                            <p className="no-data">No genres recorded</p>
                        )}
                    </div>
                </div>

                {/* Details by status */}
                <div className="status-details">
                    <h3>📋 Details by Status</h3>
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

                {/* Logout button */}
                <button onClick={handleLogout} className="btn-logout-profile">
                    Log Out
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