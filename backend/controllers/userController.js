const User = require('../models/User');
const { customAlphabet } = require('nanoid');

// Générer un ID unique de 8 caractères
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

// Créer ou récupérer un utilisateur par pseudo
const getOrCreateUser = async (req, res) => {
    try {
        const { username } = req.body;

        // Validation
        if (!username || !username.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Le pseudo est requis'
            });
        }

        const trimmedUsername = username.trim();

        // Vérifier si l'utilisateur existe déjà
        let user = await User.findOne({ username: trimmedUsername });

        if (user) {
            // Utilisateur existe déjà
            return res.json({
                success: true,
                message: 'Bienvenue !',
                data: user
            });
        }

        // Créer un nouvel utilisateur
        const userId = nanoid();
        user = new User({
            username: trimmedUsername,
            userId
        });
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Profil créé avec succès !',
            data: user
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Ce pseudo est déjà utilisé'
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la création du profil'
        });
    }
};

// Obtenir le profil par username
const getProfile = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la récupération du profil'
        });
    }
};

module.exports = {
    getOrCreateUser,
    getProfile
};