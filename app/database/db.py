import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# ✅ FORCE ONE SINGLE DATABASE FILE: app.db (ABSOLUTE PATH)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, "app.db")

DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ✅ Dependency for FastAPI routes
def get_db():
    from fastapi import Depends
    from typing import Generator

    def _get_db() -> Generator:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

    return Depends(_get_db)
