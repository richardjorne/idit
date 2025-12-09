
import os
import psycopg2

SQL = """
ALTER TABLE prompts ADD COLUMN reward INTEGER NOT NULL DEFAULT 0;
"""

def main() -> None:
    DEFAULT_DATABASE_URL = "postgresql://user:2RsZoQFlcGrUlmnncEPU1dF2RxIBwgPG@dpg-d4kvu7ngi27c73eqp10g-a.oregon-postgres.render.com/database_jqwu"
    db_url = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)

    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cur = conn.cursor()
    try:
        cur.execute(SQL)
        print("Schema updated successfully.")
    except Exception as e:
        print(f"Error updating schema: {e}")
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    main()
