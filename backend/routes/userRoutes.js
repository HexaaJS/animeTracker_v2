const express = require('express');
const router = express.Router();
const { register, login, getProfile, upgradeToPremium, updateTheme } = require('../controllers/userController');

// Inscription
router.post('/register', register);

// Connexion
router.post('/login', login);

// Profil
router.get('/profile/:username', getProfile);

// Upgrade Premium
router.post('/upgrade-premium', upgradeToPremium);

// Mettre à jour le thème
router.post('/update-theme', updateTheme);

module.exports = router;