const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRegister, validateStore } = require('../middleware/validate');

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

router.get('/dashboard', adminController.getDashboard);

// User management
router.post('/users', validateRegister, adminController.addUser);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.delete('/users/:id', adminController.deleteUser);

// Store management
router.post('/stores', validateStore, adminController.addStore);
router.get('/stores', adminController.getStores);
router.delete('/stores/:id', adminController.deleteStore);

module.exports = router;
