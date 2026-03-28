const router = require('express').Router();
const storeController = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRating } = require('../middleware/validate');

// Public: list / search stores (auth optional — to attach user rating)
router.get('/', (req, res, next) => {
  // Optionally decode token if present
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    } catch (_) {}
  }
  next();
}, storeController.getStores);

// User: submit/update rating
router.post('/:id/rate', authenticate, authorize('user'), validateRating, storeController.rateStore);

// Owner: view their stores
router.get('/my-stores', authenticate, authorize('owner'), storeController.getMyStores);

// Owner: view ratings for a specific store
router.get('/my-stores/:storeId/ratings', authenticate, authorize('owner'), storeController.getMyStoreRatings);

module.exports = router;
