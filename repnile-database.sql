-- DROP DATABASE "postgresql-horizontal-76311";
-- CREATE DATABASE "postgresql-horizontal-76311";
-- \c "postgresql-horizontal-76311";

DROP DATABASE "repnile";
CREATE DATABASE "repnile";
\c "repnile";
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
INSERT INTO animals (name, species, weight, birth_date, sex, coloration_pattern, primary_color, secondary_color, price, for_sale, img_url) VALUES ( 'Spotty', 'Gecko', 246.00, '01/22/17', 'Male', 'Spotted', 'Blue', 'Yellow', 12.99, true, '1648083588752spottedblueyellow.jpg');
INSERT INTO animals (name, species, weight, birth_date, sex, coloration_pattern, primary_color, secondary_color, price, for_sale, img_url) VALUES ( 'Leppy', 'Leopard Gecko', 334.00, '4/13/1990', 'female', 'Leopard', 'Orange', 'White', 75.99, false, '1648083645552leopardorangewhite.jpg');
INSERT INTO animals (name, species, weight, birth_date, sex, coloration_pattern, primary_color, secondary_color, price, for_sale, img_url) VALUES ( 'Cinder', 'Gecko', 432.00, '06-15-20', 'Male', 'Splotched', 'Black', 'Orange', 54.88, true, '1648083783228image0(1).jpeg');
INSERT INTO animals (name, species, weight, birth_date, sex, coloration_pattern, primary_color, secondary_color, price, for_sale, img_url) VALUES ( 'Tina', 'Desert Gecko', 333.00, '01-22-2020', 'Female', 'Spotted', 'Tan', 'Black', 177.77, true, '1648083850662image1(1).jpeg');
INSERT INTO animals (name, species, weight, birth_date, sex, coloration_pattern, primary_color, secondary_color, price, for_sale, img_url) VALUES ( 'Diablo', 'Treecko', 123.00, '8/10/22', 'Male', 'Spotted', 'Black', 'Orange', 8888.99, true, '1648083933210image2(1).jpeg');
INSERT INTO animals (name, species, weight, birth_date, sex, coloration_pattern, primary_color, secondary_color, price, for_sale, img_url) VALUES ( 'Licky', 'Gecko', 432.00, '01/01/01', 'Male', 'Desert', 'Tan', 'Black', 999.99, true, '1648083978844image3(1).jpeg');
INSERT INTO animals (name, species, weight, birth_date, sex, coloration_pattern, primary_color, secondary_color, price, for_sale, img_url) VALUES ( 'Dotty', 'Gecko', 787.88, '09/09/09', 'Male', 'Spotted', 'Yellow', 'Blue', 9.00, true, '1647873702776112-200x300.jpg');
INSERT INTO animals (name, species, weight, birth_date, sex, coloration_pattern, primary_color, secondary_color, price, for_sale, img_url) VALUES ( 'Popp', 'gecko', 455.44, '22/22/22', 'male', 'Trueblue', 'Green', 'Purple', 333.00, true, '1647873690187image0.jpeg');
INSERT INTO animals (name, species, weight, birth_date, sex, coloration_pattern, primary_color, secondary_color, price, for_sale, img_url) VALUES ( 'Croc', 'crocodile', 2313.00, '21/21/21', 'male', 'Solid', 'green', 'green', 23.00, true, '1647873676101image2.jpeg');
