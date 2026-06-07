const sequelize = require('../config/database');

const Utilisateur = require('./Utilisateur')(sequelize);
const Etudiant = require('./Etudiant')(sequelize);
const Personnel = require('./Personnel')(sequelize);
const Secretaire = require('./Secretaire')(sequelize);
const Directeur = require('./Directeur')(sequelize);
const DirecteurAdjoint = require('./DirecteurAdjoint')(sequelize);
const Professeur = require('./Professeur')(sequelize);
const ResponsableDepartement = require('./ResponsableDepartement')(sequelize);
const Scolarite = require('./Scolarite')(sequelize);
const CelluleInformatique = require('./CelluleInformatique')(sequelize);
const Requete = require('./Requete')(sequelize);
const RequeteAttestation = require('./RequeteAttestation')(sequelize);
const RequeteCorrectionNom = require('./RequeteCorrectionNom')(sequelize);
const RequeteContestationNote = require('./RequeteContestationNote')(sequelize);
const Document = require('./Document')(sequelize);
const Notification = require('./Notification')(sequelize);
const Traitement = require('./Traitement')(sequelize);
const Administration = require('./Administration')(sequelize);
const HistoriqueStatut = require('./HistoriqueStatut')(sequelize);
const ConversationChatbot = require('./ConversationChatbot')(sequelize);
const MessageChatbot = require('./MessageChatbot')(sequelize);

const models = {
  Utilisateur, Etudiant, Personnel, Secretaire, Directeur, DirecteurAdjoint,
  Professeur, ResponsableDepartement, Scolarite, CelluleInformatique,
  Requete, RequeteAttestation, RequeteCorrectionNom, RequeteContestationNote,
  Document, Notification, Traitement, Administration, HistoriqueStatut,
  ConversationChatbot, MessageChatbot,
};

Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

module.exports = { sequelize, ...models };
