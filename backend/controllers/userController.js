const User = require('../models/User');
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

// INSCRIPTION
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Le mot de passe doit contenir au moins 6 caractères'
            });
        }

        // Vérifier si l'email existe déjà
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Cet email est déjà utilisé'
            });
        }

        // Vérifier si le pseudo existe déjà
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'Ce pseudo est déjà utilisé'
            });
        }

        // Créer le nouvel utilisateur
        const userId = nanoid();
        const user = new User({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password,
            userId
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Compte créé avec succès !',
            data: user
        });
    } catch (error) {
        console.error('Erreur inscription:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de l\'inscription'
        });
    }
};

// CONNEXION
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe requis'
            });
        }

        // Chercher l'utilisateur
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        res.json({
            success: true,
            message: 'Connexion réussie !',
            data: user
        });
    } catch (error) {
        console.error('Erreur connexion:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la connexion'
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

// Upgrader à Premium
const upgradeToPremium = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'Le pseudo est requis'
            });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        if (user.isPremium) {
            return res.status(400).json({
                success: false,
                message: 'Vous êtes déjà Premium !'
            });
        }

        user.isPremium = true;
        user.premiumUnlockedAt = new Date();
        await user.save();

        res.json({
            success: true,
            message: '🎉 Premium débloqué !',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de l\'upgrade'
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    upgradeToPremium
};