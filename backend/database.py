# backend/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Local default for development
DEFAULT_DATABASE_URL = "postgresql://user:2RsZoQFlcGrUlmnncEPU1dF2RxIBwgPG@dpg-d4kvu7ngi27c73eqp10g-a.oregon-postgres.render.com/database_jqwu"

# Use DATABASE_URL from environment if available (for production)
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)

# Set SQLALCHEMY_ECHO=true to see SQL logs in development
ECHO = os.getenv("SQLALCHEMY_ECHO", "false").lower() == "true"

engine = create_engine(DATABASE_URL, echo=ECHO)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
