import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Setup = () => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { setupUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (!username.trim()) {
            setError('Le pseudo est requis');
            setLoading(false);
            return;
        }

        if (username.trim().length < 2) {
            setError('Le pseudo doit contenir au moins 2 caractères');
            setLoading(false);
            return;
        }

        if (username.trim().length > 20) {
            setError('Le pseudo ne peut pas dépasser 20 caractères');
            setLoading(false);
            return;
        }

        // Appel à la fonction setupUser
        const result = await setupUser(username.trim());

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>🎌 Anime Tracker</h1>
                <h2>Bienvenue !</h2>
                <p className="setup-subtitle">Entre ton pseudo pour commencer</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Pseudo</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ton pseudo"
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Chargement...' : 'Continuer'}
                    </button>
                </form>

                <p className="setup-info">
                    💡 Ton pseudo te permettra de retrouver tes animes sur n'importe quel appareil
                </p>
            </div>
        </div>
    );
};

export default Setup;