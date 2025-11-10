import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAnimeById, updateAnime } from '../services/animeService';
import '../styles/AnimeForm.css';

const EditAnime = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [loadingAnime, setLoadingAnime] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        status: 'A voir',
        notes: ''
    });

    // Charger l'anime au montage
    useEffect(() => {
        fetchAnime();
    }, [id]);

    const fetchAnime = async () => {
        try {
            setLoadingAnime(true);
            const response = await getAnimeById(id);
            const anime = response.data;

            setFormData({
                title: anime.title || '',
                status: anime.status || 'A voir',
                notes: anime.notes || ''
            });
        } catch (err) {
            setError('Impossible de charger l\'anime');
            console.error('Erreur:', err);
        } finally {
            setLoadingAnime(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
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
                status: formData.status,
                notes: formData.notes.trim()
            };

            await updateAnime(id, animeData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la modification');
        } finally {
            setLoading(false);
        }
    };

    if (loadingAnime) {
        return (
            <div className="form-page">
                <div className="loading">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="form-page">
            <div className="form-container">
                <div className="form-header">
                    <h1>✏️ Modifier l'anime</h1>
                    <button onClick={() => navigate('/')} className="btn-back">
                        ← Retour
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="anime-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="title">Titre *</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Titre de l'anime"
                                required
                                disabled={loading}
                                autoComplete="off"
                            />
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
                            {loading ? 'Modification...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAnime;