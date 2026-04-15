# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 프로젝트 개요

영수증(이미지/PDF)을 업로드하면 **Upstage Vision LLM**이 자동으로 파싱하여 구조화된 지출 데이터로 변환하는 경량 웹 애플리케이션입니다. DB 없이 `expenses.json` 파일 기반으로 동작하며, Vercel에 배포됩니다.

---

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프론트엔드 | React 18 + Vite 5 + TailwindCSS 3 + Axios |
| 백엔드 | Python FastAPI + LangChain + Upstage Vision LLM |
| OCR 모델 | `document-digitization-vision` (Upstage) |
| 이미지 처리 | Pillow, pdf2image |
| 데이터 저장 | `backend/data/expenses.json` (DB 미사용) |
| 배포 | Vercel (프론트 정적 빌드 + 백엔드 서버리스) |

---

## 프로젝트 구조

```
receipt-tracker/
├── frontend/
│   ├── src/
│   │   ├── pages/         # Dashboard, UploadPage, ExpenseDetail
│   │   ├── components/    # Badge, Modal, Toast 등 공용 컴포넌트
│   │   └── api/           # Axios 인스턴스 및 API 호출 함수
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── main.py            # FastAPI 앱 진입점
│   ├── routers/           # API 라우터 (upload, expenses, summary)
│   ├── services/          # LangChain + Upstage 연동 로직
│   └── data/
│       └── expenses.json  # 지출 데이터 누적 저장소
├── vercel.json            # Vercel 라우팅 설정
└── .env                   # 환경변수 (절대 커밋 금지)
```

---

## 개발 명령어

### 백엔드 (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 프론트엔드 (React + Vite)

```bash
cd frontend
npm install
npm run dev        # 개발 서버 (기본 포트 5173)
npm run build      # 프로덕션 빌드
npm run preview    # 빌드 결과 로컬 미리보기
```

---

## 아키텍처 및 데이터 흐름

```
브라우저 (React)
  │ POST /api/upload (multipart/form-data)
  ▼
FastAPI (backend/main.py)
  │
  ├── 이미지 전처리: PIL / pdf2image → Base64 인코딩
  │
  ├── services/ 레이어
  │     └── LangChain Chain
  │           ├── ChatUpstage Vision LLM 호출
  │           └── OutputParser → 구조화 JSON
  │
  └── backend/data/expenses.json에 append 저장
        │
        └── GET /api/expenses → 목록 반환
```

**핵심 설계 원칙**:
- LangChain Chain 로직은 `services/` 레이어에 격리 → LLM 교체 시 이 레이어만 수정
- Vercel 서버리스는 파일 시스템이 비지속적이므로, 프론트엔드에서 `localStorage`를 병행 저장하여 영속성 보완

---

## API 엔드포인트

| 메서드 | URL | 설명 |
|--------|-----|------|
| `POST` | `/api/upload` | 영수증 업로드 → OCR 파싱 → JSON 반환 |
| `GET` | `/api/expenses` | 지출 목록 조회 (`?from=&to=` 날짜 필터 지원) |
| `DELETE` | `/api/expenses/{id}` | 특정 지출 항목 삭제 |
| `PUT` | `/api/expenses/{id}` | 지출 항목 수정 |
| `GET` | `/api/summary` | 합계 통계 조회 (`?month=` 필터 지원) |

---

## 데이터 스키마 (`expenses.json` 항목)

```json
{
  "id": "uuid-v4-string",
  "created_at": "2025-07-15T14:30:00Z",
  "store_name": "이마트 강남점",
  "receipt_date": "2025-07-15",
  "receipt_time": "13:25",
  "category": "식료품",
  "items": [
    { "name": "신라면", "quantity": 2, "unit_price": 4500, "total_price": 9000 }
  ],
  "subtotal": 9000,
  "discount": 0,
  "tax": 0,
  "total_amount": 9000,
  "payment_method": "신용카드",
  "raw_image_path": "uploads/receipt_xxx.jpg"
}
```

---

## 환경변수

`.env` 파일에 설정하며 **절대 Git에 커밋하지 않습니다** (`.gitignore`에 `.env` 추가 필수).

| 변수명 | 설명 |
|--------|------|
| `UPSTAGE_API_KEY` | Upstage API 인증 키 |
| `VITE_API_BASE_URL` | 백엔드 API 기본 URL (프론트 빌드 시 주입) |
| `DATA_FILE_PATH` | `expenses.json` 저장 경로 |

Vercel 배포 시에는 Vercel Dashboard → Environment Variables에 등록합니다.

---

## Vercel 배포 설정 (`vercel.json`)

```json
{
  "builds": [
    { "src": "frontend/package.json", "use": "@vercel/static-build" },
    { "src": "backend/main.py", "use": "@vercel/python" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "backend/main.py" },
    { "src": "/(.*)", "dest": "frontend/dist/$1" }
  ]
}
```

---

## 지원 파일 형식 및 제약

- 업로드: JPG, PNG, PDF (최대 10MB)
- OCR 대상 언어: 한국어, 영어
- 동시 사용자: 1인 기준 MVP (인증 없음)
