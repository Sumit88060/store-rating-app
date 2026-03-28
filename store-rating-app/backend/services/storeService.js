const db = require('../config/db');

const createStore = async ({ name, email, address, owner_id }) => {
  const existing = await db.query('SELECT id FROM stores WHERE email = $1', [email]);
  if (existing.rows.length > 0) throw new Error('Store email already in use');

  const result = await db.query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, email, address, owner_id || null]
  );
  return result.rows[0];
};

const getAllStores = async (filters = {}, sort = {}) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (filters.name) { conditions.push(`s.name ILIKE $${idx++}`); values.push(`%${filters.name}%`); }
  if (filters.address) { conditions.push(`s.address ILIKE $${idx++}`); values.push(`%${filters.address}%`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSort = ['name', 'email', 'address', 'avg_rating', 'created_at'];
  const sortBy = allowedSort.includes(sort.field) ? sort.field : 's.created_at';
  const sortField = sort.field === 'avg_rating' ? 'avg_rating' : `s.${sort.field || 'created_at'}`;
  const sortDir = sort.dir === 'asc' ? 'ASC' : 'DESC';

  const result = await db.query(
    `SELECT
       s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
       u.name AS owner_name,
       ROUND(AVG(r.rating), 2) AS avg_rating,
       COUNT(r.id) AS total_ratings
     FROM stores s
     LEFT JOIN users u ON u.id = s.owner_id
     LEFT JOIN ratings r ON r.store_id = s.id
     ${where}
     GROUP BY s.id, u.name
     ORDER BY ${sortField} ${sortDir} NULLS LAST`,
    values
  );
  return result.rows;
};

const getStoreById = async (id) => {
  const result = await db.query(
    `SELECT
       s.*, u.name AS owner_name,
       ROUND(AVG(r.rating), 2) AS avg_rating,
       COUNT(r.id) AS total_ratings
     FROM stores s
     LEFT JOIN users u ON u.id = s.owner_id
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.id = $1
     GROUP BY s.id, u.name`,
    [id]
  );
  return result.rows[0] || null;
};

const getStoresByOwner = async (owner_id) => {
  const result = await db.query(
    `SELECT
       s.id, s.name, s.email, s.address, s.created_at,
       ROUND(AVG(r.rating), 2) AS avg_rating,
       COUNT(r.id) AS total_ratings
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.owner_id = $1
     GROUP BY s.id`,
    [owner_id]
  );
  return result.rows;
};

const deleteStore = async (id) => {
  await db.query('DELETE FROM stores WHERE id = $1', [id]);
};

module.exports = { createStore, getAllStores, getStoreById, getStoresByOwner, deleteStore };
