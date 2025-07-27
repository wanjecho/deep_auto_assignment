from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import json
import asyncio
from typing import List, Optional
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv
import openai
from sqlalchemy.orm import Session

from database import get_db, create_tables
from models import ChatRoom, Message
from schemas import ChatRequest, ChatResponse, ChatRoomResponse, MessageResponse

load_dotenv()

app = FastAPI(title="DeepAuto Chatbot API")

# CORS 설정 개선
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 앱 시작시 데이터베이스 테이블 생성
@app.on_event("startup")
async def startup_event():
    try:
        create_tables()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Database initialization error: {e}")

# OpenAI 클라이언트 설정
client = openai.OpenAI(
    base_url="https://api.deepauto.ai/openai/v1",
    api_key="oak-o38t6llngpdjhlga51v4uldwccw39ewa9b0e"
)

@app.get("/")
async def root():
    return {"message": "DeepAuto Chatbot API", "status": "running"}

@app.post("/chat/rooms", response_model=ChatRoomResponse)
async def create_chat_room(db: Session = Depends(get_db)):
    """새로운 채팅방 생성"""
    try:
        room = ChatRoom(
            id=str(uuid.uuid4()),
            title="새 채팅",
            created_at=datetime.utcnow()
        )
        db.add(room)
        db.commit()
        db.refresh(room)
        return room
    except Exception as e:
        print(f"Error creating chat room: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create chat room: {str(e)}")

@app.get("/chat/rooms", response_model=List[ChatRoomResponse])
async def get_chat_rooms(db: Session = Depends(get_db)):
    """모든 채팅방 목록 조회"""
    try:
        rooms = db.query(ChatRoom).order_by(ChatRoom.created_at.desc()).all()
        return rooms
    except Exception as e:
        print(f"Error fetching chat rooms: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch chat rooms: {str(e)}")

@app.get("/chat/rooms/{room_id}/messages", response_model=List[MessageResponse])
async def get_chat_messages(room_id: str, db: Session = Depends(get_db)):
    """특정 채팅방의 메시지 목록 조회"""
    try:
        messages = db.query(Message).filter(Message.room_id == room_id).order_by(Message.created_at).all()
        return messages
    except Exception as e:
        print(f"Error fetching messages: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch messages: {str(e)}")

@app.post("/chat/rooms/{room_id}/messages")
async def send_message(room_id: str, request: ChatRequest, db: Session = Depends(get_db)):
    """메시지 전송 및 AI 응답 스트리밍"""
    
    try:
        # 채팅방 존재 확인
        room = db.query(ChatRoom).filter(ChatRoom.id == room_id).first()
        if not room:
            raise HTTPException(status_code=404, detail="Chat room not found")
        
        # 사용자 메시지 저장
        user_message = Message(
            id=str(uuid.uuid4()),
            room_id=room_id,
            role="user",
            content=request.content,
            created_at=datetime.utcnow()
        )
        db.add(user_message)
        
        # 기존 메시지 히스토리 가져오기 (컨텍스트 유지)
        existing_messages = db.query(Message).filter(Message.room_id == room_id).order_by(Message.created_at).all()
        
        # OpenAI 메시지 형식으로 변환
        messages = []
        for msg in existing_messages:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": request.content})
        
        # 채팅방 제목 업데이트 (첫 메시지인 경우)
        if len(existing_messages) == 0:
            room.title = request.content[:50] + ("..." if len(request.content) > 50 else "")
            room.updated_at = datetime.utcnow()
        
        db.commit()
        
        async def generate_response():
            try:
                # AI 메시지 준비
                ai_message_id = str(uuid.uuid4())
                full_content = ""
                query_routing = None
                
                print(f"Attempting to call OpenAI API with model: openai/gpt-4o-mini-2024-07-18,deepauto/qwq-32b")
                print(f"Messages count: {len(messages)}")
                
                # 스트리밍 응답 (재시도 로직 포함)
                max_retries = 2
                for attempt in range(max_retries + 1):
                    try:
                        completion = client.chat.completions.create(
                            model="openai/gpt-4o-mini-2024-07-18,deepauto/qwq-32b",
                            messages=messages,
                            stream=True
                        )
                        
                        for chunk in completion:
                            if chunk.choices[0].delta.content is not None:
                                content = chunk.choices[0].delta.content
                                full_content += content
                                
                                response_data = {
                                    "type": "content",
                                    "content": content,
                                    "messageId": ai_message_id
                                }
                                yield f"data: {json.dumps(response_data)}\n\n"
                            
                            # query_routing 정보 추출 (안전하게 처리)
                            try:
                                if hasattr(chunk, 'query_routing') and chunk.query_routing and not query_routing:
                                    query_routing = chunk.query_routing
                                    routing_data = {
                                        "type": "routing",
                                        "routing": query_routing
                                    }
                                    yield f"data: {json.dumps(routing_data)}\n\n"
                            except Exception as routing_error:
                                print(f"Query routing 처리 중 에러 (무시됨): {routing_error}")
                                # routing 에러는 무시하고 계속 진행
                        
                        break  # 성공하면 재시도 루프 종료
                        
                    except openai.InternalServerError as api_error:
                        print(f"⚠️ OpenAI API Internal Server Error (attempt {attempt + 1}/{max_retries + 1}): {api_error}")
                        if attempt < max_retries:
                            print(f"🔄 Retrying in 2 seconds...")
                            await asyncio.sleep(2)
                            continue
                        else:
                            # 마지막 시도도 실패하면 사용자에게 알림
                            error_data = {
                                "type": "error",
                                "error": "AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
                            }
                            yield f"data: {json.dumps(error_data)}\n\n"
                            return
                    
                    except Exception as api_error:
                        print(f"❌ OpenAI API Error: {type(api_error).__name__}: {str(api_error)}")
                        error_data = {
                            "type": "error",
                            "error": f"API 호출 중 오류가 발생했습니다: {str(api_error)}"
                        }
                        yield f"data: {json.dumps(error_data)}\n\n"
                        return
                
                # AI 메시지 저장
                if full_content:  # 내용이 있을 때만 저장
                    ai_message = Message(
                        id=ai_message_id,
                        room_id=room_id,
                        role="assistant",
                        content=full_content,
                        query_routing=json.dumps(query_routing) if query_routing else None,
                        created_at=datetime.utcnow()
                    )
                    
                    db.add(ai_message)
                    db.commit()
                
                # 완료 신호
                yield f"data: {json.dumps({'type': 'done'})}\n\n"
                
            except Exception as e:
                print(f"❌ Streaming error details: {type(e).__name__}: {str(e)}")
                import traceback
                print(f"❌ Full traceback: {traceback.format_exc()}")
                error_data = {
                    "type": "error",
                    "error": "처리 중 예상치 못한 오류가 발생했습니다."
                }
                yield f"data: {json.dumps(error_data)}\n\n"
        
        return StreamingResponse(
            generate_response(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "*",
            }
        )
    
    except Exception as e:
        print(f"Error in send_message: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")

@app.delete("/chat/rooms/{room_id}")
async def delete_chat_room(room_id: str, db: Session = Depends(get_db)):
    """채팅방 삭제"""
    try:
        room = db.query(ChatRoom).filter(ChatRoom.id == room_id).first()
        if not room:
            raise HTTPException(status_code=404, detail="Chat room not found")
        
        # 관련 메시지들도 함께 삭제
        db.query(Message).filter(Message.room_id == room_id).delete()
        db.delete(room)
        db.commit()
        
        return {"message": "Chat room deleted successfully"}
    except Exception as e:
        print(f"Error deleting chat room: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete chat room: {str(e)}")

# 헬스 체크 엔드포인트
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 