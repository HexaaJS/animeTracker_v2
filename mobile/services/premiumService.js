import api from './api';

const premiumService = {
  // Créer une session de paiement Stripe
  createCheckoutSession: async (username) => {
    const response = await api.post('/api/payment/create-checkout-session', {
      username
    });
    return response.data;
  },

  // Upgrader manuellement (pour test)
  upgradeToPremium: async (username) => {
    const response = await api.post('/api/auth/upgrade-premium', {
      username
    });
    return response.data;
  },

  // Vérifier le statut premium
  checkPremiumStatus: async (username) => {
    const response = await api.get(`/api/auth/profile/${username}`);
    return response.data.data.isPremium;
  }
};

export default premiumService;