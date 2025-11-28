# init_db.py
import psycopg2

SQL = """
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_accounts (
  account_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  balance INT NOT NULL DEFAULT 0
);
"""

def main():
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        database="postgres",      # Change to your library name
        user="postgres",          # Change to your username
        password="040506"         # Change to your password
    )
    conn.autocommit = True
    cur = conn.cursor()
    try:
        cur.execute(SQL)
        print("Tables created successfully.")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    main()
