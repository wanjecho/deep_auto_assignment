from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# 환경 변수에서 데이터베이스 URL 가져오기 (기본값: PostgreSQL)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/chatbot")

print(f"Database URL: {DATABASE_URL}")  # 디버깅용

# 데이터베이스 엔진 생성
if DATABASE_URL.startswith("postgresql://"):
    print("Using PostgreSQL database")
    engine = create_engine(DATABASE_URL)
elif DATABASE_URL.startswith("sqlite"):
    print("Using SQLite database (fallback)")
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    print("Using PostgreSQL database (default)")
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!") 