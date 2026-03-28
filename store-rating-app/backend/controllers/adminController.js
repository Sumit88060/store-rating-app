const authService = require('../services/authService');
const userService = require('../services/userService');
const storeService = require('../services/storeService');
const ratingService = require('../services/ratingService');

// Dashboard analytics
const getDashboard = async (req, res) => {
  try {
    const analytics = await ratingService.getAnalytics();
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User management
const addUser = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ message: 'User created', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { name, email, role, address, sortBy, sortDir } = req.query;
    const users = await userService.getAllUsers(
      { name, email, role, address },
      { field: sortBy, dir: sortDir }
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Store management
const addStore = async (req, res) => {
  try {
    const store = await storeService.createStore(req.body);
    res.status(201).json({ message: 'Store created', store });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getStores = async (req, res) => {
  try {
    const { name, address, sortBy, sortDir } = req.query;
    const stores = await storeService.getAllStores(
      { name, address },
      { field: sortBy, dir: sortDir }
    );
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteStore = async (req, res) => {
  try {
    await storeService.deleteStore(req.params.id);
    res.json({ message: 'Store deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboard, addUser, getUsers, getUserById, deleteUser, addStore, getStores, deleteStore };
