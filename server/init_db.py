from database import create_tables, engine, SessionLocal
from models import ChatRoom, Message
import os
import sys
from sqlalchemy import text

def init_database():
    try:
        print("Initializing database...")
        print(f"Database URL: {engine.url}")
        
        # PostgreSQL 연결 테스트
        if "postgresql" in str(engine.url):
            print("Using PostgreSQL database")
            # 연결 테스트
            try:
                with engine.connect() as conn:
                    result = conn.execute(text("SELECT version();"))
                    version = result.fetchone()[0]
                    print(f"PostgreSQL version: {version}")
            except Exception as e:
                print(f"❌ PostgreSQL 연결 실패: {e}")
                print("💡 PostgreSQL 서버가 실행되고 있는지 확인하세요:")
                print("   docker run --name postgres-chatbot -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=chatbot -p 5432:5432 -d postgres:15-alpine")
                sys.exit(1)
        else:
            print("Using SQLite database")
        
        # 테이블 생성
        create_tables()
        
        # 연결 테스트
        with SessionLocal() as db:
            # 테이블이 제대로 생성되었는지 확인
            rooms_count = db.query(ChatRoom).count()
            messages_count = db.query(Message).count()
            print(f"✅ Database connection successful!")
            print(f"📊 Current data - Rooms: {rooms_count}, Messages: {messages_count}")
        
        print("🎉 Database initialization completed successfully!")
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        
        # PostgreSQL 관련 오류인 경우 도움말 제공
        if "connection" in str(e).lower() or "connect" in str(e).lower():
            print("\n💡 PostgreSQL 연결 문제 해결 방법:")
            print("1. PostgreSQL 서버 실행:")
            print("   docker run --name postgres-chatbot -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=chatbot -p 5432:5432 -d postgres:15-alpine")
            print("2. 환경변수 설정:")
            print("   Windows: set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chatbot")
            print("   Linux/Mac: export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chatbot")
            print("3. 또는 Docker Compose 사용:")
            print("   docker-compose up database")
        
        raise

if __name__ == "__main__":
    init_database() 