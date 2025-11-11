require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Import des routes
const userRoutes = require('./routes/userRoutes');
const animeRoutes = require('./routes/animeRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), require('./controllers/paymentController').handleWebhook);

// Connexion à la base de données
connectDB();


const allowedOrigins = [
    'http://localhost:3000',
    'https://graphikai.app',
    'https://www.graphikai.app'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Autoriser les requêtes sans origin (Postman, curl, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};


app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/animes', animeRoutes);
app.use('/api/payment', paymentRoutes);


// Gestion des routes non trouvées
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée'
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});