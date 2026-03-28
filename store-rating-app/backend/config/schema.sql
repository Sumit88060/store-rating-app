-- Store Rating App — PostgreSQL Schema
-- Run this file to initialize the database

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ENUM for roles
CREATE TYPE user_role AS ENUM ('admin', 'user', 'owner');

-- Users table
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(60)  NOT NULL CHECK (char_length(name) >= 20),
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  address    VARCHAR(400),
  role       user_role    NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Stores table
CREATE TABLE stores (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(60)  NOT NULL CHECK (char_length(name) >= 20),
  email      VARCHAR(255) NOT NULL UNIQUE,
  address    VARCHAR(400) NOT NULL,
  owner_id   INTEGER      REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Ratings table
CREATE TABLE ratings (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id   INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  rating     SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, store_id)
);

-- Index for performance
CREATE INDEX idx_ratings_store_id ON ratings(store_id);
CREATE INDEX idx_ratings_user_id  ON ratings(user_id);
CREATE INDEX idx_stores_owner_id  ON stores(owner_id);

-- Seed: default admin user
-- Password: Admin@123 (bcrypt hash — change in production!)
INSERT INTO users (name, email, password, address, role)
VALUES (
  'System Administrator',
  'admin@storerating.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Admin Office, Main Street, City',
  'admin'
);

-- Note: The seeded admin password above is 'password' (bcrypt default test hash).
-- After setup, log in and change it, or replace the hash with bcrypt of 'Admin@123'.
