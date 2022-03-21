DROP DATABASE repnile;
CREATE DATABASE repnile;
\c repnile;
DROP TABLE items;
DROP TABLE animals CASCADE;
DROP TABLE users;
DROP TABLE messages;
DROP TABLE message_threads CASCADE;
DROP TABLE parent_children CASCADE;
DROP TABLE events;
DROP TABLE items CASCADE;
DROP TABLE animal_photos;
DROP TABLE item_photos;

CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  name TEXT,
  type TEXT,
  description TEXT,
  stock INTEGER CHECK (stock >= 0),
  price DECIMAL(15, 2) CHECK (price >= 0),
  for_sale BOOLEAN NOT NULL DEFAULT false,
  img_url TEXT DEFAULT ''
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
  weight DECIMAL(15, 2) CHECK (price >= 0),
  birth_date TEXT DEFAULT '',
  sex TEXT DEFAULT '',
  coloration_pattern TEXT DEFAULT '',
  primary_color TEXT DEFAULT '',
  secondary_color TEXT DEFAULT '',
  price DECIMAL(15, 2) CHECK (price >= 0),
  for_sale BOOLEAN NOT NULL DEFAULT false,
  img_url TEXT DEFAULT ''
);

CREATE TABLE animal_photos (
  parent_id INTEGER
    REFERENCES animals ON DELETE CASCADE,
  img_url TEXT DEFAULT '',
  PRIMARY KEY (parent_id)
);

CREATE TABLE item_photos (
  parent_id INTEGER
    REFERENCES items ON DELETE CASCADE,
  img_url TEXT DEFAULT '',
  PRIMARY KEY (parent_id)
);
-- Animals are defaulted to not for sale
-- Could we do a birthdate and then an age that is derived from utc now()-birthdate

CREATE TABLE parent_children (
  parent_id INTEGER,
    -- REFERENCES animals ON DELETE CASCADE,
  child_id INTEGER,
  u_key TEXT UNIQUE
    -- REFERENCES animals ON DELETE CASCADE
  -- PRIMARY KEY (parent_id, child_id)
);

CREATE TABLE message_threads (
  uuid TEXT PRIMARY KEY NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title TEXT,
  date TEXT,
  description TEXT
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sender TEXT,
  recipient TEXT,
  message_text TEXT,
  message_thread_id TEXT
    REFERENCES message_threads ON DELETE CASCADE
);


-- $2b$13$GVihcIDD2GLaD1eS9FxXDuEUeWFSS13xAEpDEkUWcJYApjWvEKCvy is "password" properly hashed
INSERT INTO users (username, password, email, is_admin) VALUES ('test', '$2b$13$GVihcIDD2GLaD1eS9FxXDuEUeWFSS13xAEpDEkUWcJYApjWvEKCvy', 'email@email.com', true);
INSERT INTO events (title, date, description) VALUES ('Big Event!', 'Sometime next month', 'This is a sweet event to do some stuff');
