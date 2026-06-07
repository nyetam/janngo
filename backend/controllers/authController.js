const authService = require('../services/authService');

const authController = {
  async login(req, res) {
    try {
      const { identifiant, email, motDePasse } = req.body;
      // Accepter "identifiant" (nouveau) ou "email" (rétro-compat)
      const id = (identifiant || email || '').trim();

      if (!id || !motDePasse) {
        return res.status(400).json({
          message: 'Identifiant et mot de passe requis',
        });
      }

      const result = await authService.login(id, motDePasse);
      res.json(result);
    } catch (error) {
      // Toujours 401 pour ne pas révéler si le compte existe
      res.status(401).json({
        success: false,
        message: 'Identifiant ou mot de passe incorrect. Veuillez réessayer.',
      });
    }
  },

  async logout(req, res) {
    res.json({ message: 'Déconnexion réussie' });
  },

  async me(req, res) {
    try {
      const utilisateur = await authService.getMe(req.userId);
      if (!utilisateur) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }
      res.json(utilisateur);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = authController;
