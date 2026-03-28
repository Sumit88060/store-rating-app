const db = require('../config/db');

// Submit or update a rating (upsert)
const upsertRating = async (user_id, store_id, rating) => {
  const result = await db.query(
    `INSERT INTO ratings (user_id, store_id, rating)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, store_id)
     DO UPDATE SET rating = $3, updated_at = NOW()
     RETURNING *`,
    [user_id, store_id, rating]
  );
  return result.rows[0];
};

// Get user's existing rating for a store
const getUserRating = async (user_id, store_id) => {
  const result = await db.query(
    'SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2',
    [user_id, store_id]
  );
  return result.rows[0] || null;
};

// Get all ratings for a store (for store owner view)
const getRatingsByStore = async (store_id) => {
  const result = await db.query(
    `SELECT
       r.id, r.rating, r.created_at, r.updated_at,
       u.id AS user_id, u.name AS user_name, u.email AS user_email
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.store_id = $1
     ORDER BY r.updated_at DESC`,
    [store_id]
  );
  return result.rows;
};

// Get all ratings submitted by a user
const getRatingsByUser = async (user_id) => {
  const result = await db.query(
    `SELECT r.*, s.name AS store_name
     FROM ratings r
     JOIN stores s ON s.id = r.store_id
     WHERE r.user_id = $1`,
    [user_id]
  );
  return result.rows;
};

// Admin dashboard analytics
const getAnalytics = async () => {
  const [users, stores, ratings] = await Promise.all([
    db.query('SELECT COUNT(*) FROM users'),
    db.query('SELECT COUNT(*) FROM stores'),
    db.query('SELECT COUNT(*) FROM ratings'),
  ]);
  return {
    totalUsers: parseInt(users.rows[0].count),
    totalStores: parseInt(stores.rows[0].count),
    totalRatings: parseInt(ratings.rows[0].count),
  };
};

module.exports = { upsertRating, getUserRating, getRatingsByStore, getRatingsByUser, getAnalytics };
