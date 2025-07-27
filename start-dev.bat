@echo off
echo Starting DeepAuto Chatbot Development Environment...

REM PostgreSQL 시작
echo Starting PostgreSQL...
docker start postgres-chatbot
if errorlevel 1 (
    echo PostgreSQL container not found. Creating new one...
    docker run --name postgres-chatbot -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=chatbot -p 5432:5432 -d postgres:15-alpine
)

REM 잠시 대기
timeout /t 3

echo.
echo PostgreSQL started successfully!
echo.
echo Now you can run:
echo 1. Backend: cd server && set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chatbot && venv\Scripts\activate && uvicorn main:app --reload
echo 2. Frontend: cd nextjs && npm run dev
echo.
pause 