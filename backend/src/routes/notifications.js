const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middlewares/auth');

router.get('/vapid-key', notificationController.getVapidKey);
router.post('/subscribe', auth, notificationController.subscribe);
router.post('/unsubscribe', auth, notificationController.unsubscribe);

module.exports = router;
