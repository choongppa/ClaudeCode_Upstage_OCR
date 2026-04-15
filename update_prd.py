#!/usr/bin/env python3
"""
PRD 완료 기준 자동 업데이트 스크립트
Claude Stop hook에서 실행되어, 프로젝트 파일 상태를 분석하고
PRD_영수증_지출관리앱.md 의 완료 기준 체크박스를 업데이트합니다.
"""
import os
import re
import sys

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
PRD_PATH = os.path.join(PROJECT_ROOT, "PRD_영수증_지출관리앱.md")


def f(*paths):
    """파일 존재 여부 확인"""
    return os.path.isfile(os.path.join(PROJECT_ROOT, *paths))


def gitignore_has(pattern):
    path = os.path.join(PROJECT_ROOT, ".gitignore")
    if not os.path.isfile(path):
        return False
    return pattern in open(path, encoding="utf-8").read()


# (PRD 체크박스 텍스트에 포함된 키워드, 조건 함수) 매핑
# 키워드는 해당 체크박스 줄에서 고유하게 매칭되는 문자열
CRITERIA = [
    # ── Phase 1 ──────────────────────────────────────────────
    (
        "uvicorn backend.main:app --reload",
        lambda: f("backend", "main.py"),
    ),
    (
        "http://localhost:8000/docs",
        lambda: f("backend", "main.py"),
    ),
    (
        ".env` 파일이 `.gitignore",
        lambda: gitignore_has(".env"),
    ),
    # ── Phase 2 ──────────────────────────────────────────────
    (
        "curl -X POST /api/upload",
        lambda: f("backend", "routers", "upload.py"),
    ),
    (
        "10MB 초과 파일",
        lambda: f("backend", "routers", "upload.py"),
    ),
    (
        "PDF 파일 업로드",
        lambda: f("backend", "services", "ocr_service.py"),
    ),
    # ── Phase 3 ──────────────────────────────────────────────
    (
        "Postman으로 5개 엔드포인트",
        lambda: (
            f("backend", "routers", "upload.py")
            and f("backend", "routers", "expenses.py")
            and f("backend", "routers", "summary.py")
        ),
    ),
    (
        "GET /api/expenses?from=",
        lambda: f("backend", "routers", "expenses.py"),
    ),
    (
        "존재하지 않는 ID로 DELETE",
        lambda: f("backend", "routers", "expenses.py"),
    ),
    # ── Phase 4 ──────────────────────────────────────────────
    (
        "npm run dev",
        lambda: f("frontend", "package.json"),
    ),
    (
        "TailwindCSS 클래스",
        lambda: f("frontend", "tailwind.config.js"),
    ),
    (
        "/upload`, `/expense/:id` 3개 경로",
        lambda: f("frontend", "src", "App.jsx"),
    ),
    # ── Phase 5 ──────────────────────────────────────────────
    (
        "드래그 앤 드롭하면 OCR",
        lambda: f("frontend", "src", "components", "DropZone.jsx"),
    ),
    (
        "ProgressBar가 처리 중",
        lambda: f("frontend", "src", "components", "ProgressBar.jsx"),
    ),
    (
        "ParsePreview에서 필드를 수정",
        lambda: f("frontend", "src", "components", "ParsePreview.jsx"),
    ),
    (
        "Toast 알림이 저장 성공",
        lambda: f("frontend", "src", "components", "Toast.jsx"),
    ),
    # ── Phase 6 ──────────────────────────────────────────────
    (
        "날짜 범위 필터 적용 시",
        lambda: f("frontend", "src", "components", "FilterBar.jsx"),
    ),
    (
        "총 지출 금액이 대시보드",
        lambda: f("frontend", "src", "components", "SummaryCard.jsx"),
    ),
    (
        "내역이 없을 경우 빈 상태",
        lambda: f("frontend", "src", "pages", "Dashboard.jsx"),
    ),
    # ── Phase 7 ──────────────────────────────────────────────
    (
        "원본 이미지가 상세 화면",
        lambda: f("frontend", "src", "pages", "ExpenseDetail.jsx"),
    ),
    (
        "수정 저장 시 목록",
        lambda: f("frontend", "src", "pages", "ExpenseDetail.jsx"),
    ),
    (
        "삭제 확인 Modal",
        lambda: f("frontend", "src", "components", "Modal.jsx"),
    ),
    # ── Phase 8 ──────────────────────────────────────────────
    (
        "vercel.json",
        lambda: f("vercel.json"),
    ),
]


def update_prd() -> tuple[int, int]:
    """
    PRD 파일을 읽어 완료된 항목의 체크박스를 업데이트한다.
    Returns: (업데이트된 항목 수, 이미 체크된 항목 수)
    """
    if not os.path.isfile(PRD_PATH):
        print(f"[update_prd] PRD 파일을 찾을 수 없습니다: {PRD_PATH}", file=sys.stderr)
        return 0, 0

    with open(PRD_PATH, encoding="utf-8") as fh:
        content = fh.read()

    original = content
    newly_checked = 0
    already_checked = 0

    for keyword, condition in CRITERIA:
        # 이미 체크된 줄이면 건너뜀
        already_pattern = r'- \[x\] [^\n]*' + re.escape(keyword) + r'[^\n]*'
        if re.search(already_pattern, content):
            already_checked += 1
            continue

        if not condition():
            continue

        # - [ ] 로 시작하면서 keyword를 포함하는 줄을 - [x] 로 변경
        unchecked_pattern = r'(- \[ \] [^\n]*' + re.escape(keyword) + r'[^\n]*)'
        new_content, n = re.subn(unchecked_pattern, lambda m: m.group(0).replace("- [ ]", "- [x]", 1), content)
        if n > 0:
            content = new_content
            newly_checked += n

    if content != original:
        with open(PRD_PATH, "w", encoding="utf-8") as fh:
            fh.write(content)

    return newly_checked, already_checked


if __name__ == "__main__":
    import json as _json
    newly, already = update_prd()
    if newly:
        msg = f"PRD 업데이트: {newly}개 항목 완료 처리 (누적 완료: {already + newly}개)"
    else:
        msg = f"PRD 변경 없음 (완료 항목: {already}개)"
    print(_json.dumps({"systemMessage": msg}, ensure_ascii=False))
