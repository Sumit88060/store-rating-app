const router = require('express').Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegister } = require('../middleware/validate');

router.post('/register', validateRegister, authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);
router.put('/change-password', authenticate, authController.changePassword);

module.exports = router;
