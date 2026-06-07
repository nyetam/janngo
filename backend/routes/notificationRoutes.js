const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const notificationController = require('../controllers/notificationController');

router.use(authMiddleware);
router.use(roleMiddleware('ETUDIANT'));

router.get('/', notificationController.mesNotifications);
router.patch('/:id/lire', notificationController.marquerLu);

module.exports = router;
