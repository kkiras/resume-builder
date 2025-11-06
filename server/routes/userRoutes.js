const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const auth = require('../middlewares/auth');

router.get('/me', auth, UserController.getMe);
router.put('/me', auth, UserController.updateMe);
router.post('/upload-avatar', auth, UserController.uploadAvatar);

module.exports = router;

