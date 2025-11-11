const express = require('express');
const router = express.Router();
const { getOrCreateUser, getProfile, upgradeToPremium } = require('../controllers/userController');

// Route pour créer ou récupérer un utilisateur
router.post('/setup', getOrCreateUser);

// Route pour obtenir le profil par username
router.get('/profile/:username', getProfile);

// Route pour upgrader à Premium
router.post('/upgrade-premium', upgradeToPremium);

module.exports = router;