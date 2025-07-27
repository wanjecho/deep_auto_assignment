#!/bin/bash

echo "Starting DeepAuto Chatbot Development Environment..."

# PostgreSQL 시작
echo "Starting PostgreSQL..."
docker start postgres-chatbot

if [ $? -ne 0 ]; then
    echo "PostgreSQL container not found. Creating new one..."
    docker run --name postgres-chatbot \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_DB=chatbot \
        -p 5432:5432 \
        -d postgres:15-alpine
fi

# 잠시 대기
sleep 3

echo ""
echo "PostgreSQL started successfully!"
echo ""
echo "Now you can run:"
echo "1. Backend: cd server && export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chatbot && source venv/bin/activate && uvicorn main:app --reload"
echo "2. Frontend: cd nextjs && npm run dev"
echo ""

# 실행 권한 부여 안내
if [ ! -x "$0" ]; then
    echo "Note: Make this script executable with: chmod +x start-dev.sh"
fi 