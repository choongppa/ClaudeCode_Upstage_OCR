from fastapi import APIRouter, File, HTTPException, UploadFile

from backend.services.ocr_service import parse_receipt
from backend.services.storage_service import append_expense

router = APIRouter()

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/bmp",
    "image/tiff",
    "image/heic",
    "application/pdf",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/upload")
async def upload_receipt(file: UploadFile = File(...)):
    # 파일 형식 검증
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"지원하지 않는 파일 형식입니다. 허용 형식: JPG, PNG, PDF, BMP, TIFF",
        )

    # 파일 내용 읽기
    file_bytes = await file.read()

    # 파일 크기 검증 (10MB)
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="파일 크기가 10MB를 초과합니다.",
        )

    # OCR 파싱 (Upstage OCR API → Solar LLM)
    try:
        parsed = parse_receipt(file_bytes, file.filename or "receipt")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"OCR 파싱에 실패했습니다. 이미지를 확인하고 다시 시도해 주세요. ({e})",
        )

    # expenses.json에 UUID 부여 후 저장
    expense = append_expense(parsed)
    return expense
