/**
 * adminController.js — Cellule Informatique
 * Import en masse des étudiants depuis un fichier Excel IUT.
 *
 * Structure du fichier :
 *   Ligne 6  col E → NIVEAU D'ETUDE
 *   Ligne 7  col E → ANNEE ACADEMIQUE
 *   Ligne 8  col E → FILIERE
 *   Ligne 9       → En-têtes (N°, MATRICULE, NOMS & PRENOMS, PASSWORD)
 *   Ligne 10+     → Données : col C=MATRICULE, col D=NOM COMPLET, col E=PASSWORD
 */
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const { sequelize, Utilisateur, Etudiant } = require('../models');

// ─── Lecture Excel ─────────────────────────────────────────────────────────
function lireExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const resultats = [];

  for (const nomFeuille of workbook.SheetNames) {
    const feuille = workbook.Sheets[nomFeuille];
    if (!feuille || !feuille['!ref']) continue;

    const getCell = (row, col) => {
      const ref = XLSX.utils.encode_cell({ r: row - 1, c: col - 1 });
      const cell = feuille[ref];
      if (!cell) return '';
      // Traiter les nombres comme chaînes (cas des matricules numériques)
      return String(cell.v ?? cell.w ?? '').trim();
    };

    // Métadonnées lignes 6-8 colonne E (index col = 5)
    const niveau          = getCell(6, 5) || nomFeuille;
    const anneeAcademique = getCell(7, 5) || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;
    const filiere         = getCell(8, 5) || nomFeuille;

    const range = XLSX.utils.decode_range(feuille['!ref']);
    // Données à partir de la ligne 10 (index r = 9)
    const startRow = 9;

    for (let r = startRow; r <= range.e.r; r++) {
      const colC = feuille[XLSX.utils.encode_cell({ r, c: 2 })]; // MATRICULE
      const colD = feuille[XLSX.utils.encode_cell({ r, c: 3 })]; // NOMS & PRENOMS
      const colE = feuille[XLSX.utils.encode_cell({ r, c: 4 })]; // PASSWORD

      if (!colC || !colD) continue;

      const matricule  = String(colC.v ?? colC.w ?? '').trim().toUpperCase();
      const nomPrenom  = String(colD.v ?? colD.w ?? '').trim();
      // PASSWORD : peut être numérique (ex: 12345678) ou alphanumérique
      const motDePasse = colE ? String(colE.v ?? colE.w ?? '').trim() : '';

      if (!matricule || !nomPrenom || !motDePasse) continue;

      // Séparation : premier mot = NOM, reste = PRENOM
      const mots   = nomPrenom.split(/\s+/);
      const nom    = mots[0] || nomPrenom;
      const prenom = mots.slice(1).join(' ') || nom;

      // Email fictif interne (jamais affiché dans l'UI)
      const email = `${matricule.toLowerCase()}@janngo.local`;

      resultats.push({ matricule, nom, prenom, motDePasse, email, filiere, niveau, anneeAcademique, feuille: nomFeuille });
    }
  }

  return resultats;
}

// ─── Upsert sécurisé ──────────────────────────────────────────────────────
async function upsertEtudiant(etud) {
  const hashPwd = await bcrypt.hash(String(etud.motDePasse), 10);
  const anneeInscription = new Date().toISOString().split('T')[0];

  // 1. Chercher par matricule
  const etudiantExist = await Etudiant.findOne({ where: { matricule: etud.matricule } });

  if (etudiantExist) {
    // MàJ : toutes les infos sauf l'ID
    await Utilisateur.update(
      { nom: etud.nom, prenom: etud.prenom, motDePasse: hashPwd, actif: true },
      { where: { id: etudiantExist.id } }
    );
    await Etudiant.update(
      { filiere: etud.filiere, niveau: etud.niveau },
      { where: { id: etudiantExist.id } }
    );
    return { action: 'MIS_A_JOUR', matricule: etud.matricule, nom: `${etud.prenom} ${etud.nom}`, email: etud.email };
  }

  // 2. Créer — NE JAMAIS spécifier l'ID, laisser PostgreSQL auto-incrémenter
  const utilisateur = await Utilisateur.create({
    nom: etud.nom,
    prenom: etud.prenom,
    email: etud.email,
    motDePasse: hashPwd,
    role: 'ETUDIANT',
    actif: true,
  });

  await Etudiant.create({
    id: utilisateur.id,       // FK vers Utilisateurs.id (pas auto-increment ici)
    matricule: etud.matricule,
    filiere: etud.filiere || 'Non spécifiée',
    niveau: etud.niveau || 'Non spécifié',
    anneeInscription,
    statut: 'ACTIF',
  });

  return { action: 'CREE', matricule: etud.matricule, nom: `${etud.prenom} ${etud.nom}`, email: etud.email };
}

// ─── Controller ───────────────────────────────────────────────────────────
const adminController = {
  async importEtudiants(req, res) {
    if (!req.file) {
      console.error('[Import] Aucun fichier reçu — req.file est undefined');
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    console.log(`[Import] Fichier reçu : ${req.file.originalname} (${req.file.size} octets, type: ${req.file.mimetype})`);

    let etudiants;
    try {
      etudiants = lireExcel(req.file.buffer);
    } catch (err) {
      console.error('[Import] Erreur de lecture Excel :', err);
      return res.status(400).json({ message: `Erreur de lecture Excel : ${err.message}` });
    }

    if (etudiants.length === 0) {
      return res.status(400).json({
        message: 'Aucun étudiant trouvé dans le fichier. Vérifiez que le fichier respecte le format IUT (données à partir de la ligne 10).',
      });
    }

    console.log(`[Import] ${etudiants.length} étudiant(s) détecté(s) dans le fichier`);
    const rapport = { total: etudiants.length, crees: 0, mis_a_jour: 0, erreurs: 0, details: [], details_erreurs: [] };

    for (const etud of etudiants) {
      try {
        const result = await upsertEtudiant(etud);
        if (result.action === 'CREE') rapport.crees++;
        else rapport.mis_a_jour++;
        rapport.details.push(result);
      } catch (err) {
        console.error(`[Import] Erreur pour ${etud.matricule} :`, err.message);
        rapport.erreurs++;
        rapport.details_erreurs.push({
          matricule: etud.matricule,
          nom: `${etud.prenom} ${etud.nom}`,
          raison: err.message,
        });
      }
    }

    console.log(`[Import] Terminé — créés: ${rapport.crees}, MàJ: ${rapport.mis_a_jour}, erreurs: ${rapport.erreurs}`);
    res.json(rapport);
  },

  async previewExcel(req, res) {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier fourni' });
    try {
      const etudiants = lireExcel(req.file.buffer);
      res.json({
        total: etudiants.length,
        feuilles: [...new Set(etudiants.map((e) => e.feuille))],
        // Aperçu : masquer le password (4 premiers chars + ****)
        apercu: etudiants.slice(0, 10).map((e) => ({
          matricule: e.matricule,
          nom: e.nom,
          prenom: e.prenom,
          email: e.email,
          filiere: e.filiere,
          niveau: e.niveau,
          anneeAcademique: e.anneeAcademique,
          feuille: e.feuille,
          passwordApercu: e.motDePasse.length > 4
            ? e.motDePasse.substring(0, 4) + '****'
            : '****',
        })),
      });
    } catch (err) {
      res.status(400).json({ message: `Erreur de lecture : ${err.message}` });
    }
  },
};

module.exports = adminController;
