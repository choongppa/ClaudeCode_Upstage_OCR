import json
import os
import uuid
from datetime import datetime, timezone

_DEFAULT_PATH = "/tmp/expenses.json" if os.getenv("VERCEL") else "backend/data/expenses.json"
DATA_FILE_PATH = os.getenv("DATA_FILE_PATH", _DEFAULT_PATH)


def load_expenses() -> list:
    if not os.path.exists(DATA_FILE_PATH):
        return []
    with open(DATA_FILE_PATH, encoding="utf-8") as f:
        return json.load(f)


def save_expenses(data: list) -> None:
    dir_path = os.path.dirname(DATA_FILE_PATH)
    if dir_path:
        os.makedirs(dir_path, exist_ok=True)
    with open(DATA_FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def append_expense(item: dict) -> dict:
    item["id"] = str(uuid.uuid4())
    item["created_at"] = datetime.now(timezone.utc).isoformat()
    expenses = load_expenses()
    expenses.append(item)
    save_expenses(expenses)
    return item
