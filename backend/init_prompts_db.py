# backend/init_prompts_db.py
import os
import psycopg2

SQL = """
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS prompts (
  prompt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  preview_image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  times_used INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompts_owner_id ON prompts(owner_id);
CREATE INDEX IF NOT EXISTS idx_prompts_is_public ON prompts(is_public);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts(status);
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
        print("Prompts table created successfully.")
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    main()