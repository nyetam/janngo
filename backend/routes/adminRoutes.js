const router = require('express').Router();
const multer = require('multer');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const adminController = require('../controllers/adminController');

// Multer en mémoire (pas besoin d'écrire sur disque pour la lecture Excel)
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (['xls', 'xlsx'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers Excel (.xls, .xlsx) sont acceptés'), false);
    }
  },
});

router.use(authMiddleware);
router.use(roleMiddleware('CELLULE_INFO'));

// Aperçu du fichier Excel (sans import)
router.post('/preview-excel', uploadMemory.single('fichier'), adminController.previewExcel);

// Import effectif
router.post('/import-etudiants', uploadMemory.single('fichier'), adminController.importEtudiants);

module.exports = router;
