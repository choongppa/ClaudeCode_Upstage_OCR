from typing import Optional

from fastapi import APIRouter, Body, HTTPException, Query

from backend.services.storage_service import load_expenses, save_expenses

router = APIRouter()


@router.get("/expenses")
def get_expenses(
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
):
    """전체 지출 목록 조회 (날짜 범위 필터 지원)

    Query params:
        from_date: 시작일 YYYY-MM-DD (쿼리명: from)
        to_date:   종료일 YYYY-MM-DD (쿼리명: to)
    """
    expenses = load_expenses()

    if from_date:
        expenses = [e for e in expenses if e.get("receipt_date", "") >= from_date]
    if to_date:
        expenses = [e for e in expenses if e.get("receipt_date", "") <= to_date]

    # 날짜 내림차순 정렬
    expenses.sort(key=lambda e: e.get("receipt_date", ""), reverse=True)
    return expenses


@router.delete("/expenses/{expense_id}")
def delete_expense(expense_id: str):
    """특정 지출 항목 삭제"""
    expenses = load_expenses()
    original_len = len(expenses)

    expenses = [e for e in expenses if e.get("id") != expense_id]

    if len(expenses) == original_len:
        raise HTTPException(status_code=404, detail="해당 지출 항목을 찾을 수 없습니다.")

    save_expenses(expenses)
    return {"message": "삭제되었습니다.", "id": expense_id}


@router.put("/expenses/{expense_id}")
def update_expense(expense_id: str, body: dict = Body(...)):
    """특정 지출 항목 수정 (부분 업데이트)"""
    expenses = load_expenses()

    for i, expense in enumerate(expenses):
        if expense.get("id") == expense_id:
            # id, created_at은 변경 불가
            body.pop("id", None)
            body.pop("created_at", None)
            expenses[i].update(body)
            save_expenses(expenses)
            return expenses[i]

    raise HTTPException(status_code=404, detail="해당 지출 항목을 찾을 수 없습니다.")
