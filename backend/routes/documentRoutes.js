const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const documentController = require('../controllers/documentController');

router.use(authMiddleware);

router.post('/upload', upload.single('fichier'), documentController.upload);
router.get('/:id', documentController.telecharger);
router.patch('/:id/remplacer', upload.single('fichier'), documentController.remplacer);
router.patch('/:id/valider', documentController.toggleValide);

module.exports = router;
