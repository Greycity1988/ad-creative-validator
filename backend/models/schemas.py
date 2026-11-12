"""Pydantic models for the ad creative validator."""

from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class CheckStatus(str, Enum):
    PASS = "pass"
    FAIL = "fail"
    WARNING = "warning"
    SKIP = "skip"


class CheckResult(BaseModel):
    """Result of an individual check rule."""
    name: str = Field(..., description="Check item name e.g. 'format', 'dimensions', 'file_size', 'aspect_ratio', 'transparency', 'text_ratio'")
    status: str = Field(..., description="'pass', 'fail', 'warning', 'skip'")
    message: str = Field("", description="Human readable description in Korean")
    expected: Optional[str] = None
    actual: Optional[str] = None


class PlacementResult(BaseModel):
    """Result for a single ad placement."""
    name: str
    overall: str = Field(..., description="'pass', 'fail', 'warning'")
    checks: List[CheckResult] = Field(default_factory=list)
    is_matched_target: bool = Field(False, description="True if this placement was targeted by filename or user selection")


class PlatformResult(BaseModel):
    """Result for a single advertising platform."""
    platform: str
    platform_id: str
    overall: Optional[str] = Field("pass", description="'pass', 'fail', 'partial'")
    placements: List[PlacementResult] = Field(default_factory=list)


class ImageInfo(BaseModel):
    """Extracted metadata of an uploaded image."""
    width: int
    height: int
    format: str
    file_size_kb: float
    has_alpha: bool
    aspect_ratio: str
    aspect_ratio_value: float


class ImageValidationResult(BaseModel):
    """Validation result for one image across all requested platforms."""
    filename: str
    image_info: ImageInfo
    text_ratio: Optional[float] = None
    platform_results: List[PlatformResult] = Field(default_factory=list)


class ValidationResponse(BaseModel):
    """Response payload for /api/validate."""
    results: List[ImageValidationResult] = Field(default_factory=list)


class ReportRequest(BaseModel):
    """Payload for /api/report/excel."""
    results: List[ImageValidationResult] = Field(default_factory=list)
