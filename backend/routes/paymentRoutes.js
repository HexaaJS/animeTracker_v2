const express = require('express');
const router = express.Router();
const { createCheckoutSession, handleWebhook, checkPaymentStatus } = require('../controllers/paymentController');

// Route pour créer une session de paiement
router.post('/create-checkout-session', createCheckoutSession);

// Route webhook Stripe (DOIT être en raw body, pas JSON)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Route pour vérifier le statut d'un paiement
router.get('/status/:sessionId', checkPaymentStatus);

module.exports = router;