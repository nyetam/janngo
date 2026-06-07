require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
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
