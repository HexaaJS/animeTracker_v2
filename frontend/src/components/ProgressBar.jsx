import React, { useState, useRef } from 'react';
import '../styles/ProgressBar.css';

const ProgressBar = ({ currentEpisode, totalEpisodes, onUpdate, animeId }) => {
    const [isDragging, setIsDragging] = useState(false);
    const progressBarRef = useRef(null);

    // Calculer le pourcentage de progression
    const percentage = totalEpisodes > 0 ? (currentEpisode / totalEpisodes) * 100 : 0;

    // Gérer le clic sur la barre
    const handleClick = (e) => {
        if (!totalEpisodes) return;
        updateEpisodeFromClick(e);
    };

    // Gérer le drag
    const handleMouseDown = (e) => {
        if (!totalEpisodes) return;
        setIsDragging(true);
        updateEpisodeFromClick(e);
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !totalEpisodes) return;
        updateEpisodeFromClick(e);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Calculer l'épisode basé sur la position du clic
    const updateEpisodeFromClick = (e) => {
        const bar = progressBarRef.current;
        if (!bar) return;

        const rect = bar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const barWidth = rect.width;

        // Calculer l'épisode basé sur la position
        let newEpisode = Math.round((clickX / barWidth) * totalEpisodes);

        // Limiter entre 0 et totalEpisodes
        newEpisode = Math.max(0, Math.min(totalEpisodes, newEpisode));

        // Mettre à jour si différent
        if (newEpisode !== currentEpisode) {
            onUpdate(animeId, newEpisode);
        }
    };

    // Gérer le touch pour mobile
    const handleTouchStart = (e) => {
        if (!totalEpisodes) return;
        setIsDragging(true);
        const touch = e.touches[0];
        updateEpisodeFromTouch(touch);
    };

    const handleTouchMove = (e) => {
        if (!isDragging || !totalEpisodes) return;
        const touch = e.touches[0];
        updateEpisodeFromTouch(touch);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const updateEpisodeFromTouch = (touch) => {
        const bar = progressBarRef.current;
        if (!bar) return;

        const rect = bar.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const barWidth = rect.width;

        let newEpisode = Math.round((touchX / barWidth) * totalEpisodes);
        newEpisode = Math.max(0, Math.min(totalEpisodes, newEpisode));

        if (newEpisode !== currentEpisode) {
            onUpdate(animeId, newEpisode);
        }
    };

    // Boutons + et -
    const handleIncrement = () => {
        if (currentEpisode < (totalEpisodes || 9999)) {
            onUpdate(animeId, currentEpisode + 1);
        }
    };

    const handleDecrement = () => {
        if (currentEpisode > 0) {
            onUpdate(animeId, currentEpisode - 1);
        }
    };

    return (
        <div className="progress-bar-container">
            <div className="progress-info">
                <span className="episode-count">
                    Épisode {currentEpisode}{totalEpisodes ? `/${totalEpisodes}` : ''}
                </span>
                <span className="percentage">{Math.round(percentage)}%</span>
            </div>

            <div
                ref={progressBarRef}
                className={`progress-bar ${!totalEpisodes ? 'disabled' : ''} ${isDragging ? 'dragging' : ''}`}
                onClick={handleClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                >
                    <div className="progress-handle"></div>
                </div>
            </div>

            <div className="progress-controls">
                <button
                    className="btn-control"
                    onClick={handleDecrement}
                    disabled={currentEpisode === 0}
                >
                    -
                </button>
                <button
                    className="btn-control"
                    onClick={handleIncrement}
                    disabled={totalEpisodes && currentEpisode >= totalEpisodes}
                >
                    +
                </button>
            </div>
        </div>
    );
};

export default ProgressBar;