import React, { useState } from 'react';
import { redirectToCheckout } from '../services/premiumService';
import { X, Sparkles, Check } from 'lucide-react';
import '../styles/PremiumModal.css';

const PremiumModal = ({ isOpen, onClose, username }) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            await redirectToCheckout(username);
        } catch (error) {
            alert(error.message);
            setLoading(false);
        }
    };

    const features = [
        'Access to 20+ exclusive themes',
        'New themes added regularly',
        'One-time lifetime payment',
        'Priority support',
        'No recurring subscription'
    ];

    return (
        <div className="premium-modal-overlay" onClick={onClose}>
            <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="modal-header">
                    <Sparkles className="sparkle-icon" size={48} />
                    <h2>Unlock Premium</h2>
                    <p className="modal-subtitle">Access all exclusive themes</p>
                </div>

                <div className="modal-content">
                    <div className="price-tag">
                        <span className="price-amount">€4.99</span>
                        <span className="price-label">One-time payment</span>
                    </div>

                    <ul className="features-list">
                        {features.map((feature, index) => (
                            <li key={index}>
                                <Check size={20} className="check-icon" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        className="btn-upgrade"
                        onClick={handleUpgrade}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Redirecting to payment...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Unlock now
                            </>
                        )}
                    </button>

                    <p className="payment-secure">
                        🔒 Secure payment by Stripe
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PremiumModal;