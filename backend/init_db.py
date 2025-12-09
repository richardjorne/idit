# backend/init_db.py
import os
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
  user_id UUID NOT NULL UNIQUE REFERENCES users(user_id),
  balance INTEGER NOT NULL DEFAULT 0
);
"""

def main() -> None:
  # Use the same DATABASE_URL as SQLAlchemy
  DEFAULT_DATABASE_URL = "postgresql://user:2RsZoQFlcGrUlmnncEPU1dF2RxIBwgPG@dpg-d4kvu7ngi27c73eqp10g-a.oregon-postgres.render.com/database_jqwu"
  db_url = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)

  conn = psycopg2.connect(db_url)
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
