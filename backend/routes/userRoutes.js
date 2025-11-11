const express = require('express');
const router = express.Router();
const { register, login, getProfile, upgradeToPremium } = require('../controllers/userController');

// Inscription
router.post('/register', register);

// Connexion
router.post('/login', login);

// Profil
router.get('/profile/:username', getProfile);

// Upgrade Premium
router.post('/upgrade-premium', upgradeToPremium);

module.exports = router;