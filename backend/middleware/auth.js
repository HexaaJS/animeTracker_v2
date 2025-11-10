const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        // Récupérer le username du header
        const username = req.header('X-Username');

        if (!username) {
            return res.status(401).json({
                success: false,
                message: 'Pseudo requis'
            });
        }

        // Vérifier que l'utilisateur existe
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Attacher l'user à la requête
        req.user = user;
        req.userId = user._id;
        req.username = user.username;

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de l\'authentification'
        });
    }
};

module.exports = authMiddleware;