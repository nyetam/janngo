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
  const hashPwd = await bcrypt.hash(String(etud.motDePasse), 8); // rounds 8 pour l'import massif
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

    // ── Paramètres de pagination (tranche à traiter) ─────────────────────────
    const offset = parseInt(req.body.offset) || 0;
    const limit  = 500;
    const tousLesEtudiants = etudiants; // alias lisible
    const etudiantsATreater = tousLesEtudiants.slice(offset, offset + limit);

    console.log(`[Import] ${tousLesEtudiants.length} étudiant(s) au total — tranche ${offset}→${offset + etudiantsATreater.length}`);

    // Cas où l'offset dépasse le total (import déjà terminé)
    if (etudiantsATreater.length === 0) {
      return res.json({
        total: tousLesEtudiants.length,
        crees: 0, mis_a_jour: 0, erreurs: 0, details: [], details_erreurs: [],
        offset,
        nextOffset: offset + limit,
        hasMore: false,
      });
    }

    const rapport = { crees: 0, mis_a_jour: 0, erreurs: 0, details: [], details_erreurs: [] };

    // ── Traitement par batches ────────────────────────────────────────────────
    try {
      const BATCH_SIZE = 20;
      const TIMEOUT_MS = 4 * 60 * 1000; // 4 minutes — marge avant le timeout HTTP (5 min)
      const debut = Date.now();

      // Découper la tranche en groupes de BATCH_SIZE
      const batches = [];
      for (let i = 0; i < etudiantsATreater.length; i += BATCH_SIZE) {
        batches.push(etudiantsATreater.slice(i, i + BATCH_SIZE));
      }
      console.log(`[Import] ${batches.length} batch(s) de ${BATCH_SIZE} max à traiter`);

      for (let i = 0; i < batches.length; i++) {
        // Vérifier si on approche de la limite de 4 minutes
        if (Date.now() - debut >= TIMEOUT_MS) {
          console.log(`[Import] Limite de 4 minutes atteinte après le batch ${i} — arrêt préventif`);
          break;
        }

        const batch = batches[i];

        // Traiter tout le batch en parallèle (Promise.all)
        const resultats = await Promise.all(
          batch.map(async (etud) => {
            try {
              return await upsertEtudiant(etud);
            } catch (err) {
              console.error(`[Import] Erreur pour ${etud.matricule} :`, err.message);
              return {
                _erreur: true,
                matricule: etud.matricule,
                nom: `${etud.prenom} ${etud.nom}`,
                raison: err.message,
              };
            }
          })
        );

        // Comptabiliser les résultats du batch
        for (const r of resultats) {
          if (r._erreur) {
            rapport.erreurs++;
            rapport.details_erreurs.push({ matricule: r.matricule, nom: r.nom, raison: r.raison });
          } else if (r.action === 'CREE') {
            rapport.crees++;
            rapport.details.push(r);
          } else {
            rapport.mis_a_jour++;
            rapport.details.push(r);
          }
        }

        console.log(`[Import] Batch ${i + 1}/${batches.length} traité : ${batch.length} étudiants`);

        // Pause entre batches pour ne pas saturer la base de données
        await new Promise((r) => setTimeout(r, 50));
      }

      const hasMore = offset + limit < tousLesEtudiants.length;
      console.log(`[Import] Tranche terminée — créés: ${rapport.crees}, MàJ: ${rapport.mis_a_jour}, erreurs: ${rapport.erreurs}, hasMore: ${hasMore}`);

      res.json({
        ...rapport,
        total: tousLesEtudiants.length,  // total dans le fichier (inchangé entre tranches)
        offset,
        nextOffset: offset + limit,
        hasMore,
      });

    } catch (err) {
      // Erreur inattendue pendant le traitement (DB down, OOM, etc.)
      console.error('[Import] Erreur globale :', err.message, err.stack);
      return res.status(500).json({ message: `Erreur lors de l'import : ${err.message}` });
    }
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
