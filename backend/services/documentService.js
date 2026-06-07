const path = require('path');
const fs = require('fs');
const { Document } = require('../models');

const documentService = {
  async enregistrerDocument(file, requete_id, typeDoc) {
    const chemin = path.relative(path.join(__dirname, '..'), file.path);
    return await Document.create({
      nom: file.originalname,
      type: typeDoc || 'AUTRE',
      cheminFichier: chemin,
      taille: file.size,
      requete_id,
      valide: true,      // Présumé valide jusqu'à rejet explicite (Correction 3)
      motifRejet: null,
    });
  },

  async getDocument(id) {
    return await Document.findByPk(id);
  },

  async validerDocument(id) {
    const doc = await Document.findByPk(id);
    if (!doc) throw new Error('Document introuvable');
    doc.valide = true;
    await doc.save();
    return doc;
  },

  getCheminAbsolu(cheminRelatif) {
    return path.join(__dirname, '..', cheminRelatif);
  },
};

module.exports = documentService;
