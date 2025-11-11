const User = require('../models/User');
const { customAlphabet } = require('nanoid');

// Générer un ID unique de 8 caractères
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

// Créer ou récupérer un utilisateur par pseudo
const getOrCreateUser = async (req, res) => {
    try {
        const { username } = req.body;

        console.log('📥 Requête reçue:', { username });

        // Validation
        if (!username || !username.trim()) {
            console.log('❌ Username vide');
            return res.status(400).json({
                success: false,
                message: 'Le pseudo est requis'
            });
        }

        const trimmedUsername = username.trim();
        console.log('🔍 Recherche de l\'utilisateur:', trimmedUsername);

        // Vérifier si l'utilisateur existe déjà
        let user = await User.findOne({ username: trimmedUsername });

        console.log('👤 Résultat recherche:', user ? 'Trouvé' : 'Non trouvé');

        if (user) {
            console.log('✅ Utilisateur existe, retour des données');
            return res.json({
                success: true,
                message: 'Bienvenue !',
                data: user
            });
        }

        // Créer un nouvel utilisateur
        const userId = nanoid();
        console.log('🆕 Création nouvel utilisateur avec userId:', userId);

        user = new User({
            username: trimmedUsername,
            userId
        });

        await user.save();
        console.log('💾 Utilisateur sauvegardé avec succès');

        res.status(201).json({
            success: true,
            message: 'Profil créé avec succès !',
            data: user
        });
    } catch (error) {
        console.error('❌ ERREUR:', error);
        console.error('Code erreur:', error.code);
        console.error('Message:', error.message);

        if (error.code === 11000) {
            console.log('🔒 Erreur duplicate key');
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

        // Activer Premium
        user.isPremium = true;
        user.premiumUnlockedAt = new Date();
        await user.save();

        res.json({
            success: true,
            message: '🎉 Premium débloqué ! Tous les thèmes sont maintenant disponibles !',
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
    getOrCreateUser,
    getProfile,
    upgradeToPremium
};