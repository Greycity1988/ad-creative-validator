"""Upload and validation router."""

import json
import logging
from typing import Dict, List, Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from analyzers.image_info import extract_image_info
from analyzers.text_ratio import calculate_text_ratio
from models.schemas import ImageValidationResult, ValidationResponse
from validators import VALIDATOR_REGISTRY, get_validator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["validation"])


def _parse_platforms(platforms_raw: Optional[str]) -> List[str]:
    """Parse platforms whether received as JSON array or comma-separated string."""
    if not platforms_raw:
        return list(VALIDATOR_REGISTRY.keys())

    cleaned = platforms_raw.strip()
    if cleaned.startswith("[") and cleaned.endswith("]"):
        try:
            parsed = json.loads(cleaned)
            if isinstance(parsed, list):
                return [str(p).strip().lower() for p in parsed if str(p).strip()]
        except json.JSONDecodeError:
            pass

    # Fallback to comma separated
    return [p.strip().lower() for p in cleaned.split(",") if p.strip()]


def _parse_bool(val: Optional[str]) -> bool:
    if val is None:
        return True
    return str(val).lower() in ("true", "1", "t", "yes", "y")


def _parse_placements(placements_raw: Optional[str]) -> Dict[str, List[str]]:
    """Parse target placements per platform.
    Can be a JSON dict: {"kakao": ["비즈보드..."]} or JSON list or None.
    """
    if not placements_raw:
        return {}

    cleaned = placements_raw.strip()
    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return {k.lower(): [str(item) for item in v] for k, v in parsed.items()}
        if isinstance(parsed, list):
            # Global list of placement names across all platforms
            return {"_global": [str(item) for item in parsed]}
    except Exception:
        pass

    return {}


@router.post("/validate", response_model=ValidationResponse)
async def validate_images(
    files: List[UploadFile] = File(...),
    platforms: Optional[str] = Form(None),
    placements: Optional[str] = Form(None),
    analyze_text: Optional[str] = Form("true"),
    auto_match: Optional[str] = Form("true"),
):
    """Validate one or more uploaded images against specified ad platform guidelines."""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    target_platforms = _parse_platforms(platforms)
    target_placements_map = _parse_placements(placements)
    should_analyze_text = _parse_bool(analyze_text)
    should_auto_match = _parse_bool(auto_match)

    # Filter to valid platform IDs
    valid_platforms = [p for p in target_platforms if p in VALIDATOR_REGISTRY]
    if not valid_platforms:
        valid_platforms = list(VALIDATOR_REGISTRY.keys())

    results: List[ImageValidationResult] = []

    for file in files:
        try:
            content = await file.read()
            if not content:
                continue

            # Extract image info
            image_info = extract_image_info(file.filename or "unknown.png", content)

            # Analyze text ratio if requested
            text_ratio: Optional[float] = None
            if should_analyze_text:
                try:
                    text_ratio = calculate_text_ratio(content)
                except Exception as ex:
                    logger.warning("Text ratio calculation failed for %s: %s", file.filename, ex)
                    text_ratio = None

            # Run validators
            platform_results = []
            for pid in valid_platforms:
                try:
                    validator = get_validator(pid)
                    # Check if user specified target placements for this platform
                    platform_target_placements = target_placements_map.get(pid) or target_placements_map.get("_global")
                    p_res = validator.validate(
                        image_info,
                        text_ratio,
                        target_placements=platform_target_placements,
                        filename=file.filename or "",
                        auto_match=should_auto_match,
                    )
                    platform_results.append(p_res)
                except Exception as ex:
                    logger.error("Validator %s error: %s", pid, ex)

            results.append(
                ImageValidationResult(
                    filename=file.filename or "unknown",
                    image_info=image_info,
                    text_ratio=text_ratio,
                    platform_results=platform_results,
                )
            )
        except Exception as e:
            logger.error("Failed to process file %s: %s", file.filename, e)
            raise HTTPException(
                status_code=400,
                detail=f"Failed to process image '{file.filename}': {str(e)}",
            )

    return ValidationResponse(results=results)
