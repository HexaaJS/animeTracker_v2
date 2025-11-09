const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Générer un token JWT
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Inscription
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

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email
                    ? 'Cet email est déjà utilisé'
                    : 'Ce nom d\'utilisateur est déjà pris'
            });
        }

        // Créer l'utilisateur
        const user = new User({ username, email, password });
        await user.save();

        // Générer le token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            data: {
                user: user.toJSON(),
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de l\'inscription'
        });
    }
};

// Connexion
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

        // Trouver l'utilisateur
        const user = await User.findOne({ email });

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

        // Générer le token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Connexion réussie',
            data: {
                user: user.toJSON(),
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la connexion'
        });
    }
};

// Obtenir le profil
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');

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
    register,
    login,
    getProfile
};