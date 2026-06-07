const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const requeteController = require('../controllers/requeteController');
const attestationController = require('../controllers/attestationController');
const correctionNomController = require('../controllers/correctionNomController');
const contestationNoteController = require('../controllers/contestationNoteController');

router.use(authMiddleware);

// Routes générales
router.get('/', requeteController.lister);
router.post('/', roleMiddleware('ETUDIANT'), requeteController.creer);
router.get('/:id', requeteController.detail);
router.patch('/:id/statut', requeteController.changerStatut);
router.get('/:id/historique', requeteController.historique);

// Attestation
router.post('/attestation', roleMiddleware('ETUDIANT'), attestationController.soumettre);
router.patch('/attestation/:id/transmettre', roleMiddleware('SECRETAIRE'), attestationController.transmettre);
router.patch('/attestation/:id/orienter', roleMiddleware('DIR_ADJOINT'), attestationController.orienter);
router.patch('/attestation/:id/resultat', roleMiddleware('RESP_DEPT', 'SCOLARITE'), attestationController.retournerResultat);

// Correction nom
router.post('/correction-nom', roleMiddleware('ETUDIANT'), correctionNomController.soumettre);
router.patch('/correction-nom/:id/transmettre', roleMiddleware('SECRETAIRE'), correctionNomController.transmettre);
router.patch('/correction-nom/:id/valider', roleMiddleware('DIRECTEUR'), correctionNomController.valider);
router.patch('/correction-nom/:id/modifier', roleMiddleware('CELLULE_INFO'), correctionNomController.modifier);

// Contestation note
router.post('/contestation-note', roleMiddleware('ETUDIANT'), contestationNoteController.soumettre);
router.patch('/contestation-note/:id/analyser', roleMiddleware('RESP_DEPT'), contestationNoteController.analyser);
router.patch('/contestation-note/:id/resultat', roleMiddleware('RESP_DEPT'), contestationNoteController.retournerResultat);
router.patch('/contestation-note/:id/modifier-note', roleMiddleware('CELLULE_INFO'), contestationNoteController.modifierNote);

module.exports = router;
