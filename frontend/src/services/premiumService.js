import axios from '../config/axios';

// Créer une session de paiement Stripe
export const createCheckoutSession = async (username) => {
    const response = await axios.post('/api/payment/create-checkout-session', { username });
    return response.data;
};

// Vérifier le statut d'un paiement
export const checkPaymentStatus = async (sessionId) => {
    const response = await axios.get(`/api/payment/status/${sessionId}`);
    return response.data;
};

// Rediriger vers Stripe Checkout
export const redirectToCheckout = async (username) => {
    try {
        const { url } = await createCheckoutSession(username);
        window.location.href = url; // Redirection vers Stripe
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erreur lors de la création du paiement');
    }
};