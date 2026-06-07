'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Utilisateurs
    await queryInterface.createTable('Utilisateurs', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      nom: { type: Sequelize.STRING(50), allowNull: false },
      prenom: { type: Sequelize.STRING(50), allowNull: false },
      email: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      motDePasse: { type: Sequelize.STRING(255), allowNull: false },
      role: { type: Sequelize.ENUM('ETUDIANT','SECRETAIRE','DIRECTEUR','DIR_ADJOINT','RESP_DEPT','SCOLARITE','CELLULE_INFO'), allowNull: false },
      actif: { type: Sequelize.BOOLEAN, defaultValue: true },
      dateCreation: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });

    // Etudiants
    await queryInterface.createTable('Etudiants', {
      id: { type: Sequelize.BIGINT, primaryKey: true, references: { model: 'Utilisateurs', key: 'id' }, onDelete: 'CASCADE' },
      matricule: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      filiere: { type: Sequelize.STRING(100), allowNull: false },
      niveau: { type: Sequelize.STRING(20), allowNull: false },
      anneeInscription: { type: Sequelize.DATEONLY, allowNull: false },
      statut: { type: Sequelize.ENUM('ACTIF','SUSPENDU','DIPLOME'), defaultValue: 'ACTIF' },
    });

    // Personnels
    await queryInterface.createTable('Personnels', {
      id: { type: Sequelize.BIGINT, primaryKey: true, references: { model: 'Utilisateurs', key: 'id' }, onDelete: 'CASCADE' },
      matriculePersonnel: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      poste: { type: Sequelize.STRING(100), allowNull: false },
      service: { type: Sequelize.STRING(100), allowNull: false },
      departement: { type: Sequelize.STRING(100), allowNull: true },
      dateEmbauche: { type: Sequelize.DATEONLY, allowNull: false },
    });

    // Secretaires
    await queryInterface.createTable('Secretaires', {
      id: { type: Sequelize.BIGINT, primaryKey: true, references: { model: 'Personnels', key: 'id' }, onDelete: 'CASCADE' },
      bureau: { type: Sequelize.STRING(50), allowNull: false },
    });

    // Directeurs
    await queryInterface.createTable('Directeurs', {
      id: { type: Sequelize.BIGINT, primaryKey: true, references: { model: 'Personnels', key: 'id' }, onDelete: 'CASCADE' },
      domaineSupervision: { type: Sequelize.STRING(100), allowNull: false },
    });

    // DirecteurAdjoints
    await queryInterface.createTable('DirecteurAdjoints', {
      id: { type: Sequelize.BIGINT, primaryKey: true, references: { model: 'Personnels', key: 'id' }, onDelete: 'CASCADE' },
      domaineDelegation: { type: Sequelize.STRING(100), allowNull: false },
    });

    // Professeurs
    await queryInterface.createTable('Professeurs', {
      id: { type: Sequelize.BIGINT, primaryKey: true, references: { model: 'Personnels', key: 'id' }, onDelete: 'CASCADE' },
      specialite: { type: Sequelize.STRING(100), allowNull: false },
      grade: { type: Sequelize.STRING(50), allowNull: false },
    });

    // ResponsableDepartements
    await queryInterface.createTable('ResponsableDepartements', {
      id: { type: Sequelize.BIGINT, primaryKey: true, references: { model: 'Personnels', key: 'id' }, onDelete: 'CASCADE' },
      nomDepartement: { type: Sequelize.STRING(100), allowNull: false },
    });

    // Scolarites
    await queryInterface.createTable('Scolarites', {
      id: { type: Sequelize.BIGINT, primaryKey: true, references: { model: 'Personnels', key: 'id' }, onDelete: 'CASCADE' },
      sectionGeree: { type: Sequelize.STRING(100), allowNull: false },
    });

    // CelluleInformatiques
    await queryInterface.createTable('CelluleInformatiques', {
      id: { type: Sequelize.BIGINT, primaryKey: true, references: { model: 'Personnels', key: 'id' }, onDelete: 'CASCADE' },
      systemeGere: { type: Sequelize.STRING(100), allowNull: false },
    });

    // Requetes
    await queryInterface.createTable('Requetes', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      type: { type: Sequelize.ENUM('ATTESTATION','CORRECTION_NOM','CONTESTATION_NOTE'), allowNull: false },
      statut: { type: Sequelize.ENUM('EN_ATTENTE','EN_COURS','ATTENTE_INFO','VALIDEE','REJETEE','CLOTUREE'), defaultValue: 'EN_ATTENTE' },
      dateDepot: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      dateMiseAJour: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      description: { type: Sequelize.TEXT, allowNull: true },
      priorite: { type: Sequelize.ENUM('NORMALE','URGENTE'), defaultValue: 'NORMALE' },
      etudiant_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'Etudiants', key: 'id' } },
    });

    // RequeteAttestations
    await queryInterface.createTable('RequeteAttestations', {
      id: { type: Sequelize.BIGINT, primaryKey: true, references: { model: 'Requetes', key: 'id' }, onDelete: 'CASCADE' },
      typeAttestation: { type: Sequelize.STRING(100), allowNull: false },
      anneeAcademique: { type: Sequelize.STRING(20), allowNull: false },
      nombreExemplaires: { type: Sequelize.INTEGER, defaultValue: 1 },
    });

    // RequeteCorrectionNoms
    await queryInterface.createTable('RequeteCorrectionNoms', {
      id: { type: Sequelize.BIGINT, primaryKey: true, references: { model: 'Requetes', key: 'id' }, onDelete: 'CASCADE' },
      ancienNom: { type: Sequelize.STRING(100), allowNull: false },
      nouveauNom: { type: Sequelize.STRING(100), allowNull: false },
      serviceTraitant: { type: Sequelize.ENUM('DEPARTEMENT','SCOLARITE'), allowNull: true },
    });

    // RequeteContestationNotes
    await queryInterface.createTable('RequeteContestationNotes', {
      id: { type: Sequelize.BIGINT, primaryKey: true, references: { model: 'Requetes', key: 'id' }, onDelete: 'CASCADE' },
      matiere: { type: Sequelize.STRING(100), allowNull: false },
      noteContestee: { type: Sequelize.FLOAT, allowNull: false },
      noteCorrigee: { type: Sequelize.FLOAT, allowNull: true },
      motifContestation: { type: Sequelize.TEXT, allowNull: false },
      decisionDepartement: { type: Sequelize.TEXT, allowNull: true },
    });

    // Documents
    await queryInterface.createTable('Documents', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      nom: { type: Sequelize.STRING(100), allowNull: false },
      type: { type: Sequelize.ENUM('QUITUS','CNI','LETTRE','PROFIL','FICHE_REQUETE','COPIE_NOTE','AUTRE'), allowNull: false },
      cheminFichier: { type: Sequelize.STRING(255), allowNull: false },
      taille: { type: Sequelize.BIGINT, allowNull: false },
      dateUpload: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      valide: { type: Sequelize.BOOLEAN, defaultValue: false },
      requete_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'Requetes', key: 'id' } },
    });

    // Notifications
    await queryInterface.createTable('Notifications', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      message: { type: Sequelize.TEXT, allowNull: false },
      dateEnvoi: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      lu: { type: Sequelize.BOOLEAN, defaultValue: false },
      canal: { type: Sequelize.ENUM('EMAIL','SMS','IN_APP'), defaultValue: 'IN_APP' },
      type: { type: Sequelize.ENUM('CONFIRMATION','VALIDATION','REJET','INFO'), allowNull: false },
      etudiant_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'Etudiants', key: 'id' } },
      requete_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'Requetes', key: 'id' } },
    });

    // Traitements
    await queryInterface.createTable('Traitements', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      dateTraitement: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      commentaire: { type: Sequelize.TEXT, allowNull: true },
      decision: { type: Sequelize.ENUM('APPROUVE','REJETE','EN_ATTENTE'), allowNull: true },
      etape: { type: Sequelize.STRING(100), allowNull: false },
      dureeTraitement: { type: Sequelize.INTEGER, allowNull: true },
      requete_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'Requetes', key: 'id' } },
      personnel_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'Personnels', key: 'id' } },
    });

    // Administrations
    await queryInterface.createTable('Administrations', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      dateAction: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      typeAction: { type: Sequelize.ENUM('CREATION','MODIFICATION','SUSPENSION','CONSULTATION'), allowNull: false },
      commentaire: { type: Sequelize.TEXT, allowNull: true },
      ancienneValeur: { type: Sequelize.STRING(255), allowNull: true },
      nouvelleValeur: { type: Sequelize.STRING(255), allowNull: true },
      personnel_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'Personnels', key: 'id' } },
      etudiant_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'Etudiants', key: 'id' } },
    });

    // HistoriqueStatuts
    await queryInterface.createTable('HistoriqueStatuts', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      ancienStatut: { type: Sequelize.ENUM('EN_ATTENTE','EN_COURS','ATTENTE_INFO','VALIDEE','REJETEE','CLOTUREE'), allowNull: false },
      nouveauStatut: { type: Sequelize.ENUM('EN_ATTENTE','EN_COURS','ATTENTE_INFO','VALIDEE','REJETEE','CLOTUREE'), allowNull: false },
      dateChangement: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      motif: { type: Sequelize.TEXT, allowNull: true },
      changedBy: { type: Sequelize.STRING(100), allowNull: false },
      requete_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'Requetes', key: 'id' } },
    });

    // ConversationChatbots
    await queryInterface.createTable('ConversationChatbots', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      dateDebut: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      dateFin: { type: Sequelize.DATE, allowNull: true },
      contexte: { type: Sequelize.ENUM('ATTESTATION','CORRECTION_NOM','CONTESTATION_NOTE'), allowNull: true },
      langue: { type: Sequelize.STRING(10), defaultValue: 'fr' },
      etudiant_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'Etudiants', key: 'id' } },
    });

    // MessageChatbots
    await queryInterface.createTable('MessageChatbots', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      contenu: { type: Sequelize.TEXT, allowNull: false },
      dateEnvoi: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      expediteur: { type: Sequelize.ENUM('ETUDIANT','CHATBOT'), allowNull: false },
      type: { type: Sequelize.ENUM('QUESTION','REPONSE','GUIDAGE','FORMULAIRE'), allowNull: false },
      conversation_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'ConversationChatbots', key: 'id' } },
    });
  },

  down: async (queryInterface) => {
    const tables = [
      'MessageChatbots','ConversationChatbots','HistoriqueStatuts','Administrations',
      'Traitements','Notifications','Documents','RequeteContestationNotes',
      'RequeteCorrectionNoms','RequeteAttestations','Requetes','CelluleInformatiques',
      'Scolarites','ResponsableDepartements','Professeurs','DirecteurAdjoints',
      'Directeurs','Secretaires','Personnels','Etudiants','Utilisateurs',
    ];
    for (const t of tables) await queryInterface.dropTable(t);
  },
};
