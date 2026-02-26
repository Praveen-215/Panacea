const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationController');
const auth = require('../middlewares/auth');

router.use(auth);

router.get('/', medicationController.getAll);
router.get('/schedule/today', medicationController.getTodaySchedule);
router.get('/:id', medicationController.getOne);
router.post('/', medicationController.create);
router.put('/:id', medicationController.update);
router.delete('/:id', medicationController.remove);
router.post('/dose/take', medicationController.takeDose);

module.exports = router;
