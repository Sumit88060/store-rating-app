const storeService = require('../services/storeService');
const ratingService = require('../services/ratingService');

// User: list all stores with search
const getStores = async (req, res) => {
  try {
    const { name, address, sortBy, sortDir } = req.query;
    const stores = await storeService.getAllStores(
      { name, address },
      { field: sortBy, dir: sortDir }
    );

    // If user is logged in, attach their rating for each store
    if (req.user) {
      const userRatings = await ratingService.getRatingsByUser(req.user.id);
      const ratingMap = {};
      userRatings.forEach((r) => { ratingMap[r.store_id] = r.rating; });
      const storesWithUserRating = stores.map((s) => ({
        ...s,
        user_rating: ratingMap[s.id] || null,
      }));
      return res.json(storesWithUserRating);
    }

    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User: rate or update a store
const rateStore = async (req, res) => {
  try {
    const { id: store_id } = req.params;
    const { rating } = req.body;

    const store = await storeService.getStoreById(store_id);
    if (!store) return res.status(404).json({ message: 'Store not found' });

    const result = await ratingService.upsertRating(req.user.id, store_id, rating);
    res.json({ message: 'Rating submitted', rating: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Store Owner: view their store's ratings
const getMyStoreRatings = async (req, res) => {
  try {
    const myStores = await storeService.getStoresByOwner(req.user.id);
    if (myStores.length === 0) return res.json({ stores: [], ratings: [] });

    const storeId = req.params.storeId || myStores[0].id;

    // Ensure owner owns this store
    const owns = myStores.find((s) => s.id === parseInt(storeId));
    if (!owns) return res.status(403).json({ message: 'You do not own this store' });

    const ratings = await ratingService.getRatingsByStore(storeId);
    res.json({ store: owns, ratings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Store Owner: get all their stores
const getMyStores = async (req, res) => {
  try {
    const stores = await storeService.getStoresByOwner(req.user.id);
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStores, rateStore, getMyStoreRatings, getMyStores };
