const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.use(auth);

router.get('/', documentController.getAll);
router.post('/upload', upload.single('file'), documentController.upload);
router.put('/:id', documentController.rename);
router.delete('/:id', documentController.remove);
router.get('/:id/download', documentController.download);

module.exports = router;
