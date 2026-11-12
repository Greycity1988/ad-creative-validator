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
        # Initialize with sample community updates
        initial_data = [
            {
                "id": "fb-001",
                "title": "네이버 타임보드 및 스페셜DA 보장형 지면 추가 요청",
                "category": "신규 매체 추가",
                "content": "GFA 성과형 지면 외에 NOSP 타임보드(1660x260)와 모바일 스페셜DA(1250x520), 더블크라운 지면도 검수되면 좋겠습니다.",
                "author": "퍼포먼스 마케터 K",
                "email": "marketer@agency.com",
                "created_at": "2026-11-12 10:15",
                "status": "반영 완료",
                "reply": "2026.04 최신 가이드 기준으로 네이버 NOSP 타임보드 2종, 스페셜DA 2종, 더블크라운 및 트리플크라운 총 8개 지면이 모두 업데이트되었습니다!",
            },
            {
                "id": "fb-002",
                "title": "크리테오 플래그십 및 쇼케이스 빅배너 규격 추가 건의",
                "category": "규격 변경 제보",
                "content": "크리테오 리테일 미디어와 쇼케이스 빅배너(576x300, 310x500 등) 지면 규격도 검수에 포함해주세요.",
                "author": "미디어렙사 AE",
                "email": "ae_criteo@media.co.kr",
                "created_at": "2026-11-12 11:30",
                "status": "반영 완료",
                "reply": "크리테오 플래그십(576x300, 576x200), 쇼케이스 및 브랜디드 헤더, 표준 IAB 배너 13종이 전면 탑재되었습니다.",
            },
        ]
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
    return items


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
        reply="소중한 건의 감사합니다! 검토 후 빠른 시일 내에 규격 데이터 또는 기능에 반영하도록 하겠습니다.",
    )

    items = _load_feedbacks()
    # Insert at beginning
    items.insert(0, new_item.model_dump())
    _save_feedbacks(items)

    return new_item
