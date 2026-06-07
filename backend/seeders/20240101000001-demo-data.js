'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const hash = (pwd) => bcrypt.hashSync(pwd, 10);
    const now = new Date();

    // Utilisateurs
    await queryInterface.bulkInsert('Utilisateurs', [
      { id: 1, nom: 'Diallo', prenom: 'Amadou', email: 'etudiant@uit.sn', motDePasse: hash('etudiant123'), role: 'ETUDIANT', actif: true, dateCreation: now },
      { id: 2, nom: 'Sow', prenom: 'Fatoumata', email: 'etudiant2@uit.sn', motDePasse: hash('etudiant123'), role: 'ETUDIANT', actif: true, dateCreation: now },
      { id: 3, nom: 'Ndiaye', prenom: 'Mariama', email: 'secretaire@uit.sn', motDePasse: hash('secret123'), role: 'SECRETAIRE', actif: true, dateCreation: now },
      { id: 4, nom: 'Ba', prenom: 'Ibrahima', email: 'directeur@uit.sn', motDePasse: hash('direct123'), role: 'DIRECTEUR', actif: true, dateCreation: now },
      { id: 5, nom: 'Diop', prenom: 'Cheikh', email: 'dadjoint@uit.sn', motDePasse: hash('dadjoint123'), role: 'DIR_ADJOINT', actif: true, dateCreation: now },
      { id: 6, nom: 'Fall', prenom: 'Ousmane', email: 'dept@uit.sn', motDePasse: hash('dept123'), role: 'RESP_DEPT', actif: true, dateCreation: now },
      { id: 7, nom: 'Mbaye', prenom: 'Aissatou', email: 'scolarite@uit.sn', motDePasse: hash('scol123'), role: 'SCOLARITE', actif: true, dateCreation: now },
      { id: 8, nom: 'Kane', prenom: 'Moussa', email: 'cellule@uit.sn', motDePasse: hash('cellule123'), role: 'CELLULE_INFO', actif: true, dateCreation: now },
    ]);

    // Etudiants
    await queryInterface.bulkInsert('Etudiants', [
      { id: 1, matricule: 'UIT2024001', filiere: 'Informatique', niveau: 'L3', anneeInscription: '2021-10-01', statut: 'ACTIF' },
      { id: 2, matricule: 'UIT2024002', filiere: 'Réseaux & Télécoms', niveau: 'M1', anneeInscription: '2020-10-01', statut: 'ACTIF' },
    ]);

    // Personnels
    await queryInterface.bulkInsert('Personnels', [
      { id: 3, matriculePersonnel: 'PERS001', poste: 'Secrétaire', service: 'Secrétariat', departement: null, dateEmbauche: '2018-09-01' },
      { id: 4, matriculePersonnel: 'PERS002', poste: 'Directeur', service: 'Direction', departement: null, dateEmbauche: '2015-09-01' },
      { id: 5, matriculePersonnel: 'PERS003', poste: 'Directeur Adjoint', service: 'Direction', departement: null, dateEmbauche: '2016-09-01' },
      { id: 6, matriculePersonnel: 'PERS004', poste: 'Responsable Département', service: 'Informatique', departement: 'Informatique', dateEmbauche: '2017-09-01' },
      { id: 7, matriculePersonnel: 'PERS005', poste: 'Agent Scolarité', service: 'Scolarité', departement: null, dateEmbauche: '2019-09-01' },
      { id: 8, matriculePersonnel: 'PERS006', poste: 'Technicien Informatique', service: 'Cellule Informatique', departement: null, dateEmbauche: '2020-09-01' },
    ]);

    // Rôles spécialisés
    await queryInterface.bulkInsert('Secretaires', [{ id: 3, bureau: 'Bureau 101' }]);
    await queryInterface.bulkInsert('Directeurs', [{ id: 4, domaineSupervision: 'Pédagogie et Administration' }]);
    await queryInterface.bulkInsert('DirecteurAdjoints', [{ id: 5, domaineDelegation: 'Gestion des Étudiants' }]);
    await queryInterface.bulkInsert('ResponsableDepartements', [{ id: 6, nomDepartement: 'Informatique' }]);
    await queryInterface.bulkInsert('Scolarites', [{ id: 7, sectionGeree: 'Licence & Master' }]);
    await queryInterface.bulkInsert('CelluleInformatiques', [{ id: 8, systemeGere: 'Système de gestion académique' }]);

    // Requêtes de test
    await queryInterface.bulkInsert('Requetes', [
      { id: 1, type: 'ATTESTATION', statut: 'EN_ATTENTE', dateDepot: now, dateMiseAJour: now, description: 'Besoin d\'attestation de scolarité pour visa', priorite: 'NORMALE', etudiant_id: 1 },
      { id: 2, type: 'CORRECTION_NOM', statut: 'EN_ATTENTE', dateDepot: now, dateMiseAJour: now, description: 'Mon prénom est mal orthographié', priorite: 'URGENTE', etudiant_id: 1 },
      { id: 3, type: 'CONTESTATION_NOTE', statut: 'EN_ATTENTE', dateDepot: now, dateMiseAJour: now, description: 'Note de mathématiques incorrecte', priorite: 'NORMALE', etudiant_id: 2 },
    ]);

    await queryInterface.bulkInsert('RequeteAttestations', [
      { id: 1, typeAttestation: 'Certificat de scolarité', anneeAcademique: '2023-2024', nombreExemplaires: 2 },
    ]);

    await queryInterface.bulkInsert('RequeteCorrectionNoms', [
      { id: 2, ancienNom: 'Dialo', nouveauNom: 'Diallo', serviceTraitant: null },
    ]);

    await queryInterface.bulkInsert('RequeteContestationNotes', [
      { id: 3, matiere: 'Mathématiques Discrètes', noteContestee: 8.5, noteCorrigee: null, motifContestation: 'La correction de ma copie comporte des erreurs de calcul', decisionDepartement: null },
    ]);

    // Historique initial
    await queryInterface.bulkInsert('HistoriqueStatuts', [
      { ancienStatut: 'EN_ATTENTE', nouveauStatut: 'EN_ATTENTE', dateChangement: now, motif: 'Soumission initiale', changedBy: 'etudiant_1', requete_id: 1 },
      { ancienStatut: 'EN_ATTENTE', nouveauStatut: 'EN_ATTENTE', dateChangement: now, motif: 'Soumission initiale', changedBy: 'etudiant_1', requete_id: 2 },
      { ancienStatut: 'EN_ATTENTE', nouveauStatut: 'EN_ATTENTE', dateChangement: now, motif: 'Soumission initiale', changedBy: 'etudiant_2', requete_id: 3 },
    ]);

    // Notifications
    await queryInterface.bulkInsert('Notifications', [
      { message: 'Votre demande d\'attestation a été soumise avec succès.', dateEnvoi: now, lu: false, canal: 'IN_APP', type: 'CONFIRMATION', etudiant_id: 1, requete_id: 1 },
      { message: 'Votre demande de correction de nom a été soumise avec succès.', dateEnvoi: now, lu: false, canal: 'IN_APP', type: 'CONFIRMATION', etudiant_id: 1, requete_id: 2 },
      { message: 'Votre contestation de note a été soumise avec succès.', dateEnvoi: now, lu: false, canal: 'IN_APP', type: 'CONFIRMATION', etudiant_id: 2, requete_id: 3 },
    ]);
  },

  down: async (queryInterface) => {
    const tables = [
      'Notifications','HistoriqueStatuts','RequeteContestationNotes',
      'RequeteCorrectionNoms','RequeteAttestations','Requetes',
      'CelluleInformatiques','Scolarites','ResponsableDepartements',
      'DirecteurAdjoints','Directeurs','Secretaires','Personnels','Etudiants','Utilisateurs',
    ];
    for (const t of tables) await queryInterface.bulkDelete(t, null, {});
  },
};
