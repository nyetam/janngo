const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Utilisateur, Etudiant, Personnel } = require('../models');

const INCLUDE = [
  { model: Etudiant, as: 'etudiant', required: false },
  { model: Personnel, as: 'personnel', required: false },
];

/**
 * Trouver l'utilisateur depuis un identifiant qui peut être :
 *  1. Matricule étudiant (Etudiant.matricule) — insensible à la casse
 *  2. Email (Utilisateur.email)
 *  3. Matricule personnel (Personnel.matriculePersonnel)
 */
async function trouverUtilisateur(identifiant) {
  const idUpper = identifiant.toUpperCase();

  // 1. Matricule étudiant
  const etudiant = await Etudiant.findOne({ where: { matricule: idUpper } });
  if (etudiant) {
    return Utilisateur.findOne({ where: { id: etudiant.id, actif: true }, include: INCLUDE });
  }

  // 2. Email (insensible à la casse via lower())
  const parEmail = await Utilisateur.findOne({
    where: { email: identifiant.toLowerCase(), actif: true },
    include: INCLUDE,
  });
  if (parEmail) return parEmail;

  // 3. Matricule personnel
  const personnel = await Personnel.findOne({ where: { matriculePersonnel: idUpper } });
  if (personnel) {
    return Utilisateur.findOne({ where: { id: personnel.id, actif: true }, include: INCLUDE });
  }

  return null;
}

const authService = {
  async login(identifiant, motDePasse) {
    if (!identifiant?.trim() || !motDePasse) {
      throw new Error('Identifiant et mot de passe requis');
    }

    const utilisateur = await trouverUtilisateur(identifiant.trim());
    if (!utilisateur) {
      throw new Error('Identifiant ou mot de passe incorrect');
    }

    const valide = await bcrypt.compare(String(motDePasse), utilisateur.motDePasse);
    if (!valide) {
      throw new Error('Identifiant ou mot de passe incorrect');
    }

    const token = jwt.sign(
      { id: utilisateur.id, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const userJson = utilisateur.toJSON();
    delete userJson.motDePasse;
    return { token, utilisateur: userJson };
  },

  async getMe(userId) {
    return Utilisateur.findOne({
      where: { id: userId, actif: true },
      include: INCLUDE,
      attributes: { exclude: ['motDePasse'] },
    });
  },
};

module.exports = authService;
