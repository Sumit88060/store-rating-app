const db = require('../config/db');

// Build dynamic WHERE clause for filters
const buildUserFilters = ({ name, email, role, address }) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (name)    { conditions.push(`name ILIKE $${idx++}`);    values.push(`%${name}%`); }
  if (email)   { conditions.push(`email ILIKE $${idx++}`);   values.push(`%${email}%`); }
  if (role)    { conditions.push(`role = $${idx++}`);        values.push(role); }
  if (address) { conditions.push(`address ILIKE $${idx++}`); values.push(`%${address}%`); }

  return { conditions, values };
};

const getAllUsers = async (filters = {}, sort = {}) => {
  const { conditions, values } = buildUserFilters(filters);
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSort = ['name', 'email', 'role', 'created_at'];
  const sortBy = allowedSort.includes(sort.field) ? sort.field : 'created_at';
  const sortDir = sort.dir === 'asc' ? 'ASC' : 'DESC';

  const result = await db.query(
    `SELECT id, name, email, address, role, created_at
     FROM users
     ${where}
     ORDER BY ${sortBy} ${sortDir}`,
    values
  );
  return result.rows;
};

// Get single user — if owner, also include their store's avg rating
const getUserById = async (id) => {
  const result = await db.query(
    `SELECT
       u.id, u.name, u.email, u.address, u.role, u.created_at,
       CASE WHEN u.role = 'owner' THEN (
         SELECT ROUND(AVG(r.rating), 2)
         FROM stores s
         LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.owner_id = u.id
       ) END AS store_avg_rating,
       CASE WHEN u.role = 'owner' THEN (
         SELECT s.name FROM stores s WHERE s.owner_id = u.id LIMIT 1
       ) END AS store_name
     FROM users u
     WHERE u.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const deleteUser = async (id) => {
  await db.query('DELETE FROM users WHERE id = $1', [id]);
};

module.exports = { getAllUsers, getUserById, deleteUser };
