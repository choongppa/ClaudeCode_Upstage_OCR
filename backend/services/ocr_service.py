import os

import requests
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.output_parsers import JsonOutputParser
from langchain_upstage import ChatUpstage

UPSTAGE_API_KEY = os.getenv("UPSTAGE_API_KEY", "")

OCR_API_URL = "https://api.upstage.ai/v1/document-digitization"

SYSTEM_PROMPT = """당신은 영수증 OCR 전문가입니다.
주어진 영수증 텍스트에서 정보를 추출하여 아래 JSON 형식으로만 응답하세요.
다른 설명 텍스트는 절대 포함하지 마세요. JSON만 출력하세요.

{
  "store_name": "가게 이름 (string)",
  "receipt_date": "YYYY-MM-DD 형식 날짜 (string)",
  "receipt_time": "HH:MM 형식 시간 또는 null",
  "category": "식료품|외식|교통|쇼핑|의료|기타 중 하나 (string)",
  "items": [
    {
      "name": "품목명 (string)",
      "quantity": 수량 (int),
      "unit_price": 단가 원화 정수 (int),
      "total_price": 품목합계 원화 정수 (int)
    }
  ],
  "subtotal": 소계 원화 정수 (int),
  "discount": 할인액 원화 정수 (int, 없으면 0),
  "tax": 세금 원화 정수 (int, 없으면 0),
  "total_amount": 최종결제금액 원화 정수 (int),
  "payment_method": "결제수단 (string) 또는 null"
}

규칙:
- 모든 금액은 원화 정수 (소수점 없음)
- receipt_date는 반드시 YYYY-MM-DD 형식
- category는 반드시 6개 중 하나로 분류
- 항목을 알 수 없으면 null 또는 빈 배열 사용"""


def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """Upstage Document OCR API로 파일에서 텍스트 추출"""
    headers = {"Authorization": f"Bearer {UPSTAGE_API_KEY}"}
    files = {"document": (filename, file_bytes)}
    data = {"model": "ocr"}

    response = requests.post(
        OCR_API_URL, headers=headers, files=files, data=data, timeout=30
    )
    response.raise_for_status()

    result = response.json()
    # 전체 페이지 텍스트 합산
    pages = result.get("pages", [])
    if pages:
        return "\n".join(page.get("text", "") for page in pages)
    return result.get("text", "")


def parse_receipt_text(ocr_text: str) -> dict:
    """ChatUpstage(Solar)로 OCR 텍스트를 구조화 JSON으로 변환"""
    llm = ChatUpstage(api_key=UPSTAGE_API_KEY)

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"다음 영수증 텍스트에서 정보를 추출하세요:\n\n{ocr_text}"),
    ]

    response = llm.invoke(messages)
    return JsonOutputParser().parse(response.content)


def parse_receipt(file_bytes: bytes, filename: str) -> dict:
    """영수증 파일을 받아 구조화 JSON으로 파싱 (2단계 파이프라인)"""
    # Step 1: Upstage OCR API → 원문 텍스트 추출
    ocr_text = extract_text_from_file(file_bytes, filename)

    if not ocr_text.strip():
        raise ValueError("영수증에서 텍스트를 추출할 수 없습니다.")

    # Step 2: Solar LLM → 구조화 JSON 변환
    return parse_receipt_text(ocr_text)
