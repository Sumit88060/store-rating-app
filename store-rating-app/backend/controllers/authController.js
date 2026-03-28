const authService = require('../services/authService');

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ message: 'Registered successfully', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { token, user } = await authService.login(req.body);
    res.json({ token, user });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    await authService.changePassword(req.user.id, req.body);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const me = (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, changePassword, me };
