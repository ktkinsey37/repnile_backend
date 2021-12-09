\echo 'Delete and recreate repnile db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE repnile;
CREATE DATABASE repnile;
\connect repnile

\i repnile-schema.sql
\i repnile-seed.sql

\echo 'Delete and recreate repnile_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE repnile_test;
CREATE DATABASE repnile_test;
\connect repnile_test

\i repnile-schema.sql
