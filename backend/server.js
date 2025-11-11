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

// IMPORTANT: Route webhook AVANT express.json() pour recevoir le raw body
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), require('./controllers/paymentController').handleWebhook);

// Connexion à la base de données
connectDB();

// Origines autorisées
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', // Vite si besoin
    /^https:\/\/([a-z0-9-]+\.)*graphikai\.app$/i,
];

// Configuration CORS
const corsOptions = {
    origin(origin, callback) {
        if (!origin) return callback(null, true); // Postman/cURL
        const ok = allowedOrigins.some((o) =>
            o instanceof RegExp ? o.test(origin) : o === origin
        );
        return ok ? callback(null, true) : callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Username'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Gestion erreur CORS
app.use((err, req, res, next) => {
    if (err && err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'Origin non autorisé par CORS',
            origin: req.headers.origin
        });
    }
    next(err);
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Preflight pour toutes les routes
app.options('*', cors(corsOptions));

// Route de test
app.get('/', (req, res) => {
    res.json({
        message: '🎌 API Anime Tracker',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            animes: '/api/animes',
            payment: '/api/payment'
        }
    });
});

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
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
EOF
cat / home / claude / animeTracker / backend / server.js

Output
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

// IMPORTANT: Route webhook AVANT express.json() pour recevoir le raw body
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), require('./controllers/paymentController').handleWebhook);

// Connexion à la base de données
connectDB();

// Origines autorisées
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', // Vite si besoin
    /^https:\/\/([a-z0-9-]+\.)*graphikai\.app$/i,
];

// Configuration CORS
const corsOptions = {
    origin(origin, callback) {
        if (!origin) return callback(null, true); // Postman/cURL
        const ok = allowedOrigins.some((o) =>
            o instanceof RegExp ? o.test(origin) : o === origin
        );
        return ok ? callback(null, true) : callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Username'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Gestion erreur CORS
app.use((err, req, res, next) => {
    if (err && err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'Origin non autorisé par CORS',
            origin: req.headers.origin
        });
    }
    next(err);
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Preflight pour toutes les routes
app.options('*', cors(corsOptions));

// Route de test
app.get('/', (req, res) => {
    res.json({
        message: '🎌 API Anime Tracker',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            animes: '/api/animes',
            payment: '/api/payment'
        }
    });
});

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
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});