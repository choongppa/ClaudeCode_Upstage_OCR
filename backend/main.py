from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

load_dotenv()

from backend.routers import expenses, summary, upload

app = FastAPI(
    title="Receipt Expense Tracker API",
    description="영수증 OCR 기반 지출 관리 API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 디렉토리 자동 생성
DATA_FILE_PATH = os.getenv("DATA_FILE_PATH", "backend/data/expenses.json")
os.makedirs(os.path.dirname(DATA_FILE_PATH), exist_ok=True)
os.makedirs("backend/uploads", exist_ok=True)

# expenses.json 초기화 (없을 경우)
if not os.path.exists(DATA_FILE_PATH):
    with open(DATA_FILE_PATH, "w", encoding="utf-8") as f:
        f.write("[]")

# 라우터 등록
app.include_router(upload.router, prefix="/api")
app.include_router(expenses.router, prefix="/api")
app.include_router(summary.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Receipt Expense Tracker API가 정상 실행 중입니다."}
