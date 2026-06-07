const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const rapportController = require('../controllers/rapportController');

router.use(authMiddleware);
router.use(roleMiddleware('DIRECTEUR'));

router.get('/activite', rapportController.activite);
router.get('/requetes', rapportController.statistiquesRequetes);

module.exports = router;
