"""Feedback and suggestion router for user feedback and spec requests."""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Optional
from uuid import uuid4
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/feedbacks", tags=["feedback"])

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
FEEDBACKS_FILE = DATA_DIR / "feedbacks.json"


class FeedbackItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4())[:8])
    title: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., description="'신규 매체 추가', '규격 변경 제보', '기능 개선', '버그 신고'")
    content: str = Field(..., min_length=5, max_length=2000)
    author: str = Field(default="익명 마케터", max_length=50)
    email: Optional[str] = Field(None, max_length=100)
    created_at: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M"))
    status: str = Field(default="검토 중", description="'검토 중', '반영 완료', '답변 완료'")
    reply: Optional[str] = None


class FeedbackCreateRequest(BaseModel):
    title: str
    category: str
    content: str
    author: Optional[str] = "익명 마케터"
    email: Optional[str] = None


def _load_feedbacks() -> List[dict]:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not FEEDBACKS_FILE.exists():
        initial_data: List[dict] = []
        with open(FEEDBACKS_FILE, "w", encoding="utf-8") as f:
            json.dump(initial_data, f, ensure_ascii=False, indent=2)
        return initial_data

    try:
        with open(FEEDBACKS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error("Failed to read feedbacks: %s", e)
        return []


def _save_feedbacks(items: List[dict]):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(FEEDBACKS_FILE, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)


@router.get("", response_model=List[FeedbackItem])
async def list_feedbacks():
    """Retrieve all feedback and feature suggestions, ordered by newest first."""
    items = _load_feedbacks()
    # This list is public: never expose submitters' contact emails
    return [{**item, "email": None} for item in items]


@router.post("", response_model=FeedbackItem)
async def create_feedback(req: FeedbackCreateRequest):
    """Submit a new feedback or spec addition suggestion."""
    if not req.title.strip() or not req.content.strip():
        raise HTTPException(status_code=400, detail="제목과 내용을 입력해주세요.")

    new_item = FeedbackItem(
        title=req.title.strip(),
        category=req.category.strip() or "기능 개선",
        content=req.content.strip(),
        author=req.author.strip() if req.author else "익명 마케터",
        email=req.email.strip() if req.email else None,
        status="검토 중",
    )

    items = _load_feedbacks()
    # Insert at beginning
    items.insert(0, new_item.model_dump())
    _save_feedbacks(items)

    return new_item
