const jwt = require('jsonwebtoken');
const { Utilisateur, Etudiant, Personnel } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant ou invalide' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const utilisateur = await Utilisateur.findOne({
      where: { id: decoded.id, actif: true },
      include: [
        { model: Etudiant, as: 'etudiant', required: false },
        { model: Personnel, as: 'personnel', required: false },
      ],
    });

    if (!utilisateur) {
      return res.status(401).json({ message: 'Utilisateur introuvable ou désactivé' });
    }

    req.user = utilisateur;
    req.userId = utilisateur.id;
    req.userRole = utilisateur.role;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expirée, veuillez vous reconnecter' });
    }
    return res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = authMiddleware;
