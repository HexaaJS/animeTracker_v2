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
        status: 'To Watch',
        notes: ''
    });

    // Load anime on mount
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
                status: anime.status || 'To Watch',
                notes: anime.notes || ''
            });
        } catch (err) {
            setError('Unable to load anime');
            console.error('Error:', err);
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
            setError('Title is required');
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
            setError(err.response?.data?.message || 'Error updating anime');
        } finally {
            setLoading(false);
        }
    };

    if (loadingAnime) {
        return (
            <div className="form-page">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="form-page">
            <div className="form-container">
                <div className="form-header">
                    <h1>✏️ Edit Anime</h1>
                    <button onClick={() => navigate('/')} className="btn-back">
                        ← Back
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="anime-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="title">Title *</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Anime title"
                                required
                                disabled={loading}
                                autoComplete="off"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="To Watch">To Watch</option>
                                <option value="Watching">Watching</option>
                                <option value="Completed">Completed</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Dropped">Dropped</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">Personal Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Your impressions, comments..."
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
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAnime;