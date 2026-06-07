const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const chatbotController = require('../controllers/chatbotController');

router.use(authMiddleware);
router.use(roleMiddleware('ETUDIANT'));

router.post('/message', chatbotController.envoyerMessage);
router.get('/historique', chatbotController.historique);

module.exports = router;
