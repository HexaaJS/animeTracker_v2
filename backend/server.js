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
    'http://localhost:5173', // Vite si besoin
    /^https:\/\/([a-z0-9-]+\.)*graphikai\.app$/i,
];

const corsOptions = {
    origin(origin, callback) {
        if (!origin) return callback(null, true); // Postman/cURL
        const ok = allowedOrigins.some((o) =>
            o instanceof RegExp ? o.test(origin) : o === origin
        );
        return ok ? callback(null, true) : callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // si tu envoies des cookies/session
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

app.use((err, req, res, next) => {
    if (err && err.message === 'Not allowed by CORS') {
        return res.status(403).json({ success: false, message: 'Origin non autorisé par CORS', origin: req.headers.origin });
    }
    next(err);
});



app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.options('*', cors());

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