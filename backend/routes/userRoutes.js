const express = require('express');
const router = express.Router();
const { getOrCreateUser, getProfile } = require('../controllers/userController');

// Route pour créer ou récupérer un utilisateur
router.post('/setup', getOrCreateUser);

// Route pour obtenir le profil par username
router.get('/profile/:username', getProfile);

module.exports = router;