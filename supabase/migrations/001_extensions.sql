-- Enable pgcrypto for hashing functions (like crypt) and UUID generation
create extension if not exists "pgcrypto";
