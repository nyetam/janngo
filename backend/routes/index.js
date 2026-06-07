const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/requetes', require('./requeteRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/chatbot', require('./chatbotRoutes'));
router.use('/rapports', require('./rapportRoutes'));
router.use('/documents', require('./documentRoutes'));
router.use('/admin', require('./adminRoutes'));

module.exports = router;
