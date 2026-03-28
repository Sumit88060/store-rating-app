// Shared validation helpers

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// 8–16 chars, at least one uppercase, at least one special character
const validatePassword = (password) => {
  if (!password || password.length < 8 || password.length > 16) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
  return true;
};

const validateRegister = (req, res, next) => {
  const { name, email, password, address } = req.body;

  if (!name || name.length < 20 || name.length > 60) {
    return res.status(400).json({ message: 'Name must be between 20 and 60 characters' });
  }
  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({
      message: 'Password must be 8–16 characters with at least one uppercase letter and one special character',
    });
  }
  if (address && address.length > 400) {
    return res.status(400).json({ message: 'Address must be at most 400 characters' });
  }

  next();
};

const validateStore = (req, res, next) => {
  const { name, email, address } = req.body;

  if (!name || name.length < 20 || name.length > 60) {
    return res.status(400).json({ message: 'Store name must be between 20 and 60 characters' });
  }
  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid store email format' });
  }
  if (!address || address.length > 400) {
    return res.status(400).json({ message: 'Address is required and must be at most 400 characters' });
  }

  next();
};

const validateRating = (req, res, next) => {
  const { rating } = req.body;
  const r = Number(rating);
  if (!rating || !Number.isInteger(r) || r < 1 || r > 5) {
    return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
  }
  next();
};

module.exports = { validateRegister, validateStore, validateRating };
