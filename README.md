# Daily Flow

일정 관리 웹 페이지 입니다. 
오늘 해야 할 일 대시보드와 모든 할 일 대시보드로 업무를 한눈에 파악하여 관리할 수 있습니다.

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | React 19, Vite, CSS Modules |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB Atlas (Mongoose) |

---

## 프로젝트 구조

```
todo-main/
├── frontend/               # React 클라이언트
│   └── src/
│       ├── App.jsx         # 메인 컴포넌트
│       └── App.module.css  # 스타일
│
└── backend/                # Express 서버
    ├── index.js            # 서버 진입점
    ├── models/
    │   └── Task.js         # Mongoose 스키마
    └── routes/
        ├── create.js       # POST /tasks
        ├── read.js         # GET /tasks
        ├── modify.js       # PUT /tasks/:id
        └── delete.js       # DELETE /tasks/:id
```

---

## 설치 및 실행

### 1. 저장소 클론

```bash
git clone <repo-url>
cd todo-main
```

### 2. Backend 실행

```bash
cd backend
npm install
```

`backend/.env` 파일 생성 후 MongoDB 연결 URI 입력:

```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>
```

```bash
npm start
# → http://localhost:3001
```

### 3. Frontend 실행

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 주요 기능

- **오늘의 대시보드** — 당일 할 일 / 완료 / 진행 중 통계
- **우선순위 관리** — 3단계 (High / Medium / Low)
- **카테고리 분류** — 일정별 카테고리 태그
- **필터 & 검색** — 카테고리, 상태, 키워드로 필터링
- **정렬** — 마감일 / 우선순위 / 생성일 기준 정렬
- **다크 모드** — 라이트 / 다크 테마 전환
- **반응형 디자인** 

---

## API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/tasks` | 전체 일정 조회 |
| `POST` | `/tasks` | 새 일정 생성 |
| `PUT` | `/tasks/:id` | 일정 수정 (완료 토글 등) |
| `DELETE` | `/tasks/:id` | 일정 삭제 |

### 데이터베이스 필드

```js
{
  task_name:    String,   // 필수
  category:     String,   // 기본값: 'General'
  priority:     String,   // 'High' | 'Medium' | 'Low' (기본값: 'Medium')
  is_completed: Boolean,  // 기본값: false
  due_date:     Date      // 필수
}
```

### 실행 영상 


https://github.com/user-attachments/assets/2893ad6a-ad32-414f-88bb-5611c64ae33f

