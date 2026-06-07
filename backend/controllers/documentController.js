const path = require('path');
const fs = require('fs');
const documentService = require('../services/documentService');
const notificationService = require('../services/notificationService');
const { Document, Requete, Etudiant } = require('../models');

// Limites de documents par type de requête (Correction 1)
const MAX_DOCS = {
  ATTESTATION: 4,       // Quitus + Profil + CNI + Lettre
  CORRECTION_NOM: 2,    // Quitus + Lettre
  CONTESTATION_NOTE: 2, // Fiche requête + Feuille de note (optionnel)
};

const documentController = {
  /**
   * POST /api/documents/upload
   * Upload d'un fichier et association à une requête.
   * Règles :
   *   - EN_ATTENTE : libre jusqu'à la limite max
   *   - Autre statut : uniquement si le document du même type est invalide (rejeté)
   * Par défaut : valide = true (Correction 3)
   */
  async upload(req, res) {
    try {
      if (!req.file) return res.status(400).json({ message: 'Aucun fichier fourni' });

      const { requete_id, type } = req.body;
      if (!requete_id) return res.status(400).json({ message: 'requete_id requis' });

      const requete = await Requete.findByPk(requete_id, {
        include: [{ model: Document, as: 'documents' }],
      });
      if (!requete) return res.status(404).json({ message: 'Requête introuvable' });

      const docs = requete.documents || [];
      const maxDocs = MAX_DOCS[requete.type] || 10;

      if (requete.statut !== 'EN_ATTENTE') {
        // Hors EN_ATTENTE : autoriser uniquement si ce type de doc a été rejeté
        const docRejete = docs.find((d) => d.type === type && !d.valide);
        if (!docRejete) {
          return res.status(403).json({
            message: 'Impossible d\'ajouter des documents après soumission. Seuls les documents rejetés par le personnel peuvent être remplacés.',
          });
        }
        // Supprimer l'ancien fichier rejeté
        const ancienChemin = documentService.getCheminAbsolu(docRejete.cheminFichier);
        if (fs.existsSync(ancienChemin)) { try { fs.unlinkSync(ancienChemin); } catch {} }
        await docRejete.destroy();
      } else {
        // EN_ATTENTE : vérifier d'abord si c'est un remplacement (même type)
        const existant = docs.find((d) => d.type === type);
        if (existant) {
          // Remplacement — supprimer l'ancien, pas de vérification du nombre total
          const ancienChemin = documentService.getCheminAbsolu(existant.cheminFichier);
          if (fs.existsSync(ancienChemin)) { try { fs.unlinkSync(ancienChemin); } catch {} }
          await existant.destroy();
        } else {
          // Nouvel ajout — vérifier la limite
          if (docs.length >= maxDocs) {
            return res.status(400).json({ message: `Maximum de ${maxDocs} documents atteint pour ce type de requête.` });
          }
        }
      }

      // Créer le document avec valide=true par défaut (Correction 3)
      const doc = await documentService.enregistrerDocument(req.file, requete_id, type);
      res.status(201).json(doc);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  /**
   * GET /api/documents/:id
   * Télécharger / ouvrir un document dans le navigateur (inline).
   */
  async telecharger(req, res) {
    try {
      const doc = await documentService.getDocument(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Document introuvable' });

      const cheminAbsolu = documentService.getCheminAbsolu(doc.cheminFichier);
      if (!fs.existsSync(cheminAbsolu)) {
        return res.status(404).json({ message: 'Fichier introuvable sur le serveur' });
      }

      const ext = path.extname(doc.cheminFichier).toLowerCase();
      const mimeTypes = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
      const mime = mimeTypes[ext] || 'application/octet-stream';

      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.nom)}"`);
      res.sendFile(cheminAbsolu);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * PATCH /api/documents/:id/remplacer
   * Remplacer un document rejeté (valide=false) par un nouveau fichier.
   * Interdit si le document est encore valide.
   */
  async remplacer(req, res) {
    try {
      if (!req.file) return res.status(400).json({ message: 'Aucun fichier fourni' });

      const doc = await Document.findByPk(req.params.id, {
        include: [{ model: Requete, as: 'requete' }],
      });
      if (!doc) return res.status(404).json({ message: 'Document introuvable' });

      if (doc.valide) {
        return res.status(403).json({
          message: 'Ce document n\'a pas été rejeté. Le remplacement est impossible.',
        });
      }

      // Supprimer l'ancien fichier
      const ancienChemin = documentService.getCheminAbsolu(doc.cheminFichier);
      if (fs.existsSync(ancienChemin)) { try { fs.unlinkSync(ancienChemin); } catch {} }

      // Créer le nouveau document avec valide=true par défaut
      await doc.destroy();
      const nouveau = await documentService.enregistrerDocument(req.file, doc.requete_id, doc.type);
      res.status(201).json(nouveau);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  /**
   * PATCH /api/documents/:id/valider
   * Valider ou invalider un document par le personnel.
   * Si invalide → sauvegarder le motif et notifier l'étudiant (Correction 5).
   */
  async toggleValide(req, res) {
    try {
      const doc = await Document.findByPk(req.params.id, {
        include: [{
          model: Requete,
          as: 'requete',
          include: [{ model: Etudiant, as: 'etudiant' }],
        }],
      });
      if (!doc) return res.status(404).json({ message: 'Document introuvable' });

      const { valide, motifRejet } = req.body;
      const nouvelleValeur = valide !== undefined ? Boolean(valide) : !doc.valide;

      if (!nouvelleValeur && !motifRejet?.trim()) {
        return res.status(400).json({ message: 'Le motif de rejet est obligatoire pour invalider un document.' });
      }

      doc.valide = nouvelleValeur;
      doc.motifRejet = nouvelleValeur ? null : (motifRejet?.trim() || doc.motifRejet);
      await doc.save();

      // Notifier l'étudiant si document rejeté (Correction 5)
      if (!nouvelleValeur && doc.requete?.etudiant_id) {
        await notificationService.creerNotification(
          doc.requete.etudiant_id,
          doc.requete_id,
          'REJETEE',
          `Votre document "${doc.nom}" (requête #${doc.requete_id}) a été rejeté. Motif : ${doc.motifRejet}. Veuillez le remplacer.`
        );
      }

      res.json(doc);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = documentController;
