"""Main FastAPI application entry point."""

from datetime import datetime
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import yaml

from routers.upload import router as upload_router
from routers.report import router as report_router
from routers.feedback import router as feedback_router
from validators import VALIDATOR_REGISTRY, get_validator

app = FastAPI(
    title="광고 소재 이미지 검수 시스템 API",
    description="주요 광고 플랫폼 규격 검수 및 리포트 API",
    version="1.2.0",
)

# CORS setup (no cookies or auth headers are used, so credentials stay off with the wildcard origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload_router)
app.include_router(report_router)
app.include_router(feedback_router)


@app.get("/api/health")
async def health():
    return {
        "service": "Ad Creative Validator API",
        "status": "online",
        "platforms": list(VALIDATOR_REGISTRY.keys()),
    }


@app.get("/api/platforms")
async def list_platforms():
    """Return available platforms and their spec metadata including placement details, official update dates, and source URLs."""
    platforms_meta = []
    for pid in sorted(VALIDATOR_REGISTRY.keys()):
        try:
            validator = get_validator(pid)
            placements_info = []
            for p in validator.spec.get("placements", []):
                p_name = p.get("name", "")
                exact_w, exact_h = p.get("exact_width"), p.get("exact_height")
                min_w, min_h = p.get("min_width"), p.get("min_height")
                rec_w, rec_h = p.get("recommended_width"), p.get("recommended_height")
                dim_str = ""
                if exact_w and exact_h:
                    dim_str = f"{exact_w}×{exact_h}px"
                elif rec_w and rec_h:
                    dim_str = f"권장 {rec_w}×{rec_h}px"
                elif min_w and min_h:
                    dim_str = f"최소 {min_w}×{min_h}px"

                ar = p.get("aspect_ratio")
                ar_str = f"{ar[0]}:{ar[1]}" if ar and len(ar) == 2 else ""

                placements_info.append({
                    "name": p_name,
                    "dimension_str": dim_str,
                    "aspect_ratio_str": ar_str,
                    "allowed_formats": p.get("allowed_formats", []),
                })

            platforms_meta.append({
                "id": pid,
                "name": validator.platform_name,
                "description": validator.spec.get("description", ""),
                "official_update_date": validator.spec.get("official_update_date", "공식 최신 가이드"),
                "official_source_name": validator.spec.get("official_source_name", "공식 가이드 센터"),
                "official_source_url": validator.spec.get("official_source_url", ""),
                "revision_summary": validator.spec.get("revision_summary", ""),
                "last_verified_date": validator.spec.get("last_verified_date", "2026-11-12"),
                "placements_count": len(placements_info),
                "placements": [p["name"] for p in placements_info],
                "placements_detail": placements_info,
            })
        except Exception as e:
            platforms_meta.append({
                "id": pid,
                "name": pid,
                "description": "",
                "official_update_date": "공식 최신 가이드",
                "official_source_name": "공식 가이드 센터",
                "official_source_url": "",
                "revision_summary": "",
                "last_verified_date": "2026-11-12",
                "placements_count": 0,
                "placements": [],
                "placements_detail": [],
            })
    return {"platforms": platforms_meta}


@app.post("/api/specs/update")
async def update_all_specs():
    """Reload the spec files and report what is loaded.

    This does not compare anything against publisher documentation and does not touch
    last_verified_date: that date is set by hand in the YAML when a person has checked the guide.
    """
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    specs_dir = Path(__file__).resolve().parent / "specs"

    total_placements = 0
    loaded_files = 0
    verified_dates = []

    for yaml_file in specs_dir.glob("*.yaml"):
        try:
            with open(yaml_file, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f) or {}

            total_placements += len(data.get("placements", []))
            if data.get("last_verified_date"):
                verified_dates.append(str(data["last_verified_date"]))
            loaded_files += 1
        except Exception:
            pass

    oldest_verified = min(verified_dates) if verified_dates else None

    return {
        "success": True,
        "message": (
            f"규격 파일 {loaded_files}개({total_placements}개 세부 지면)를 다시 읽었습니다. "
            f"공식 가이드와의 자동 대조는 하지 않으며, 가장 오래된 수동 확인일은 {oldest_verified or '기록 없음'}입니다."
        ),
        "checked_at": now_str,
        "oldest_verified_date": oldest_verified,
        "total_platforms": loaded_files,
        "total_placements": total_placements,
    }


# Mount static frontend for production deployment if dist directory exists
PROD_DIST_PATH = Path(__file__).resolve().parent.parent / "frontend" / "dist"
LOCAL_STATIC_PATH = Path(__file__).resolve().parent / "static"
if PROD_DIST_PATH.exists():
    app.mount("/", StaticFiles(directory=str(PROD_DIST_PATH), html=True), name="frontend")
elif LOCAL_STATIC_PATH.exists():
    app.mount("/", StaticFiles(directory=str(LOCAL_STATIC_PATH), html=True), name="frontend")
