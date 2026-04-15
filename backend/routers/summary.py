from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter

from backend.services.storage_service import load_expenses

router = APIRouter()


@router.get("/summary")
def get_summary(month: Optional[str] = None):
    """지출 합계 통계 조회

    Query params:
        month: YYYY-MM (선택, 없으면 전체 기간)

    Response:
        total_amount:      전체 기간 총 지출
        this_month_amount: 이번 달(현재 월) 지출
        category_summary:  카테고리별 합계
    """
    expenses = load_expenses()

    # month 필터 적용
    if month:
        filtered = [e for e in expenses if e.get("receipt_date", "").startswith(month)]
    else:
        filtered = expenses

    total_amount = sum(e.get("total_amount", 0) for e in filtered)

    # 이번 달 금액
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")
    this_month_amount = sum(
        e.get("total_amount", 0)
        for e in expenses
        if e.get("receipt_date", "").startswith(current_month)
    )

    # 카테고리별 합계
    category_map: dict[str, int] = {}
    for e in filtered:
        cat = e.get("category", "기타") or "기타"
        category_map[cat] = category_map.get(cat, 0) + e.get("total_amount", 0)

    category_summary = [
        {"category": cat, "amount": amt}
        for cat, amt in sorted(category_map.items(), key=lambda x: -x[1])
    ]

    return {
        "total_amount": total_amount,
        "this_month_amount": this_month_amount,
        "total_count": len(filtered),
        "category_summary": category_summary,
    }
