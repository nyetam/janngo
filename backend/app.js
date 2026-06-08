require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Origines autorisées : localhost (dev) + URL Render (prod) + FRONTEND_URL (var d'env)
const ORIGINES_AUTORISEES = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://janngo-frontend.onrender.com',
  process.env.FRONTEND_URL,
].filter(Boolean); // supprimer les valeurs undefined/null

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (Postman, curl, appels serveur→serveur)
    if (!origin || ORIGINES_AUTORISEES.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Origine refusée : ${origin}`);
      callback(new Error(`Origine CORS non autorisée : ${origin}`));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers uploadés (accès authentifié via controller)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API
app.use('/api', require('./routes'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', app: 'Janngo API' }));

// 404
app.use((req, res) => res.status(404).json({ message: 'Route introuvable' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: err.message || 'Erreur interne du serveur' });
});

module.exports = app;
