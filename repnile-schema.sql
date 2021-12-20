DROP DATABASE repnile;
CREATE DATABASE repnile;
DROP TABLE items;
DROP TABLE animals CASCADE;
DROP TABLE users;
DROP TABLE messages;
DROP TABLE message_threads CASCADE;
DROP TABLE parent_children CASCADE;

CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  name TEXT,
  type TEXT,
  amt_in_stock INTEGER CHECK (amt_in_stock >= 0),
  price INTEGER CHECK (price >= 0),
  for_sale BOOLEAN NOT NULL DEFAULT false
);

-- Users table, first name and last name left out for now.
CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  -- first_name TEXT NOT NULL,
  -- last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE animals (
  id SERIAL PRIMARY KEY,
  name TEXT DEFAULT '',
  species TEXT DEFAULT '',
  weight INTEGER DEFAULT 0 CHECK(weight > 0),
  age INTEGER CHECK (age >= 0),
  sex TEXT DEFAULT '',
  coloration_pattern TEXT DEFAULT '',
  primary_color TEXT DEFAULT '',
  secondary_color TEXT DEFAULT '',
  price INTEGER CHECK (price >= 0),
  for_sale BOOLEAN NOT NULL DEFAULT false,
  img_url TEXT DEFAULT ''
);
-- Animals are defaulted to not for sale

CREATE TABLE parent_children (
  parent_id INTEGER
    REFERENCES animals ON DELETE CASCADE,
  child_id INTEGER
    REFERENCES animals ON DELETE CASCADE,
  PRIMARY KEY (parent_id, child_id)
);

CREATE TABLE message_threads (
  uuid TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  from_ TEXT,
  to_ TEXT,
  message_text TEXT,
  message_thread_id TEXT
    REFERENCES message_threads ON DELETE CASCADE
)