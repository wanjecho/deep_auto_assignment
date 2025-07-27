# DeepAuto Chatbot

DeepAuto.ai Scaleserve API를 활용한 실시간 스트리밍 챗봇 애플리케이션입니다.

## 🚀 특징

- **실시간 스트리밍**: AI 응답을 실시간으로 스트리밍하여 표시
- **모델 라우팅 정보**: 각 메시지에 대한 AI 모델 라우팅 결과와 후보 모델 점수 표시
- **채팅 기록 관리**: 채팅방별 메시지 기록 저장 및 불러오기
- **ChatGPT 스타일 UI**: 친숙한 다크 테마 인터페이스
- **컨텍스트 유지**: 채팅 세션별 대화 맥락 유지

## 🛠 기술 스택

### Frontend
- **Next.js 14**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안전성을 위한 정적 타입 시스템
- **TailwindCSS**: 유틸리티 퍼스트 CSS 프레임워크
- **Lucide React**: 아이콘 라이브러리

### Backend
- **FastAPI**: 고성능 Python 웹 프레임워크
- **SQLAlchemy**: Python ORM
- **PostgreSQL**: 관계형 데이터베이스
- **OpenAI Python SDK**: DeepAuto API 클라이언트

### Infrastructure
- **Docker**: PostgreSQL 컨테이너화
- **Server-Sent Events (SSE)**: 실시간 스트리밍 통신

## 📦 실행 방법

### 🏆 권장 방법: Docker PostgreSQL + 로컬 개발

**개발 시에는 이 방법을 권장합니다** (빠른 개발, 쉬운 디버깅)

#### 1️⃣ 사전 준비

```bash
# 레포지토리 클론
git clone <repository-url>
cd deepauto

# Docker 설치 확인
docker --version
```

#### 2️⃣ 간편 시작 (스크립트 사용)

**Windows:**
```cmd
# PostgreSQL 자동 시작
start-dev.bat
```

**Linux/Mac:**
```bash
# 스크립트 실행 권한 부여 (최초 1회)
chmod +x start-dev.sh

# PostgreSQL 자동 시작
./start-dev.sh
```

#### 3️⃣ 백엔드 실행

```bash
# 새 터미널 1: 백엔드
cd server

# 환경변수 설정
set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chatbot    # Windows
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chatbot  # Linux/Mac

# 가상환경 생성 및 활성화 (최초 1회)
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Linux/Mac

# 의존성 설치 (최초 1회)
pip install -r requirements.txt

# 데이터베이스 초기화 (최초 1회)
python init_db.py

# 서버 실행
uvicorn main:app --reload
```

#### 4️⃣ 프론트엔드 실행

```bash
# 새 터미널 2: 프론트엔드
cd nextjs

# 의존성 설치 (최초 1회)
npm install

# 개발 서버 실행
npm run dev
```

#### 5️⃣ 접속 확인

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs

---

### 🐳 대안: Docker Compose 전체 실행

**팀 공유, 데모, 배포 테스트 시 사용**

```bash
# 전체 스택 실행 (PostgreSQL + 백엔드 + 프론트엔드)
docker-compose up --build

# 백그라운드 실행
docker-compose up -d --build

# 종료
docker-compose down
```

접속: http://localhost:3000

---

### ⚙️ 수동 설정 (고급 사용자용)

<details>
<summary>세부 설정이 필요한 경우</summary>

#### PostgreSQL 수동 설치 및 실행

```bash
# PostgreSQL 컨테이너 직접 실행
docker run --name postgres-chatbot \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=chatbot \
  -p 5432:5432 \
  -d postgres:15-alpine

# 컨테이너 재시작 (재부팅 후)
docker start postgres-chatbot
```

#### 환경변수 상세 설정

**.env 파일 생성 (server 폴더):**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chatbot
DEEPAUTO_API_KEY=oak-o38t6llngpdjhlga51v4uldwccw39ewa9b0e
DEEPAUTO_BASE_URL=https://api.deepauto.ai/openai/v1
```

</details>

---

## 🏗 아키텍처 개요

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │    FastAPI      │    │  PostgreSQL     │
│   Frontend      │◄──►│    Backend      │◄──►│   Database      │
│   (Port 3000)   │    │   (Port 8000)   │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   User Browser  │    │ DeepAuto.ai API │
│                 │    │   Scaleserve    │
└─────────────────┘    └─────────────────┘
```

## 🗄 데이터베이스 설계

### ERD
```
┌─────────────────┐         ┌─────────────────┐
│   chat_rooms    │         │    messages     │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄────────┤ id (PK)         │
│ title           │    1:N  │ room_id (FK)    │
│ created_at      │         │ role            │
│ updated_at      │         │ content         │
└─────────────────┘         │ query_routing   │
                            │ created_at      │
                            └─────────────────┘
```

### 테이블 상세

#### `chat_rooms`
| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | String | PRIMARY KEY | 채팅방 고유 ID (UUID) |
| title | String | NOT NULL | 채팅방 제목 |
| created_at | DateTime | NOT NULL | 생성 시간 |
| updated_at | DateTime | NOT NULL | 수정 시간 |

#### `messages`
| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | String | PRIMARY KEY | 메시지 고유 ID (UUID) |
| room_id | String | FOREIGN KEY | 채팅방 ID |
| role | String | NOT NULL | 메시지 역할 ('user' \| 'assistant') |
| content | Text | NOT NULL | 메시지 내용 |
| query_routing | Text | NULLABLE | 모델 라우팅 정보 (JSON) |
| created_at | DateTime | NOT NULL | 생성 시간 |

## 🔧 API 엔드포인트

### 채팅방 관리
- `POST /chat/rooms` - 새 채팅방 생성
- `GET /chat/rooms` - 채팅방 목록 조회
- `DELETE /chat/rooms/{room_id}` - 채팅방 삭제

### 메시지 관리
- `GET /chat/rooms/{room_id}/messages` - 채팅방 메시지 조회
- `POST /chat/rooms/{room_id}/messages` - 메시지 전송 (스트리밍)

### 스트리밍 응답 형식
```json
// 콘텐츠 청크
{"type": "content", "content": "텍스트", "messageId": "uuid"}

// 라우팅 정보
{"type": "routing", "routing": {"selected_model": "model", "candidates": [...]}}

// 완료 신호
{"type": "done"}

// 오류
{"type": "error", "error": "에러 메시지"}
```

## 🎯 주요 기능

### 1. 실시간 스트리밍
- Server-Sent Events를 통한 실시간 응답 스트리밍
- 타이핑 효과로 자연스러운 사용자 경험

### 2. 모델 라우팅 표시
- 선택된 AI 모델 정보 표시
- 후보 모델들의 점수 비교 기능

### 3. 채팅 기록 관리
- 채팅방별 메시지 히스토리 저장
- 이전 대화 내용 불러오기
- 대화 컨텍스트 유지

### 4. 사용자 친화적 UI
- ChatGPT 스타일의 다크 테마
- 반응형 디자인
- 직관적인 메시지 입력 인터페이스

## 🔐 환경 변수

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chatbot
DEEPAUTO_API_KEY=oak-o38t6llngpdjhlga51v4uldwccw39ewa9b0e
DEEPAUTO_BASE_URL=https://api.deepauto.ai/openai/v1
```

## 🐛 문제 해결

### 1. PostgreSQL 연결 오류
```bash
# PostgreSQL 컨테이너 상태 확인
docker ps | grep postgres

# 컨테이너 재시작
docker restart postgres-chatbot

# 로그 확인
docker logs postgres-chatbot
```

### 2. 백엔드 실행 오류
```bash
# 환경변수 확인
echo $DATABASE_URL    # Linux/Mac
echo %DATABASE_URL%   # Windows

# 가상환경 확인
which python          # Linux/Mac
where python          # Windows

# 의존성 재설치
pip install -r requirements.txt
```

### 3. 프론트엔드 빌드 오류
```bash
# 의존성 재설치
cd nextjs
rm -rf node_modules package-lock.json
npm install

# 캐시 클리어
rm -rf .next
npm run dev
```

### 4. 포트 충돌 오류
```bash
# 사용 중인 포트 확인
netstat -an | findstr :8000    # Windows
netstat -an | grep :8000       # Linux/Mac

# 프로세스 종료
taskkill /F /PID [PID]         # Windows
kill -9 [PID]                 # Linux/Mac
```

## 📄 일일 개발 워크플로우

### 매일 시작할 때
```bash
# 1. PostgreSQL 시작 (재부팅 후에만)
docker start postgres-chatbot

# 2. 백엔드 실행
cd server
set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chatbot  # Windows
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chatbot  # Linux/Mac
venv\Scripts\activate    # Windows
source venv/bin/activate # Linux/Mac
uvicorn main:app --reload

# 3. 프론트엔드 실행 (새 터미널)
cd nextjs
npm run dev
```

### 작업 종료할 때
```bash
# 서버들 종료 (Ctrl+C)
# PostgreSQL은 계속 실행 (필요시에만 중지)
docker stop postgres-chatbot
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 