#!/usr/bin/env python3
"""Synchronize YAML specifications from backend/specs to frontend/src/data/specsData.json."""

import json
from pathlib import Path
import yaml

ROOT_DIR = Path(__file__).resolve().parent.parent
SPECS_DIR = ROOT_DIR / "backend" / "specs"
OUTPUT_JSON = ROOT_DIR / "frontend" / "src" / "data" / "specsData.json"

PLATFORM_NAMES = {
    "acetrader": "에이스트레이더 (AceTrader)",
    "adison": "애디슨 오퍼월",
    "adpopcorn": "애드팝콘 (AdPopcorn)",
    "appier": "애피어 (Appier)",
    "buzzvil": "버즈빌 (Buzzvil)",
    "cauly": "카울리 (Cauly)",
    "chzzk": "네이버 치지직 (CHZZK)",
    "coupang": "쿠팡 광고 (Coupang)",
    "criteo": "크리테오 (Criteo)",
    "daangn": "당근 전문가모드",
    "dable": "데이블 (Dable)",
    "google_ads": "구글 애즈 (Google Ads)",
    "kakao": "카카오 비즈보드 & 디스플레이",
    "linkedin": "링크드인 (LinkedIn Ads)",
    "meta": "메타 (Facebook & Instagram)",
    "moloco": "몰로코 (Moloco Cloud DSP)",
    "naver": "네이버 성과형 DA & GFA",
    "onestore": "원스토어 애즈 (ONE store Ads)",
    "pinterest": "핀터레스트 (Pinterest)",
    "realclick": "리얼클릭 (RealClick)",
    "reddit": "레딧 (Reddit)",
    "rtb_house": "RTB House",
    "snapchat": "스냅챗 (Snapchat)",
    "soop": "숲 (SOOP, 구 아프리카TV)",
    "spotify": "스포티파이 (Spotify)",
    "syrup": "시럽 / OK캐쉬백 (Planet AD)",
    "taboola": "타불라 (Taboola)",
    "targetpick": "타겟픽 (TargetPick)",
    "tiktok": "틱톡 (TikTok Ads)",
    "tnk": "티엔케이팩토리 (TNK Factory)",
    "toss": "토스 광고 (Toss Ads)",
    "twitter": "엑스 (X / Twitter)",
}


def sync_specs():
    platforms_meta = []

    for yaml_path in sorted(SPECS_DIR.glob("*.yaml")):
        pid = yaml_path.stem
        try:
            with open(yaml_path, "r", encoding="utf-8") as f:
                spec = yaml.safe_load(f) or {}

            placements_detail = []
            for p in spec.get("placements", []):
                p_copy = dict(p)
                exact_w = p.get("exact_width")
                exact_h = p.get("exact_height")
                rec_w = p.get("recommended_width")
                rec_h = p.get("recommended_height")
                min_w = p.get("min_width")
                min_h = p.get("min_height")

                dim_str = ""
                if exact_w and exact_h:
                    dim_str = f"{exact_w}×{exact_h}px"
                elif rec_w and rec_h:
                    dim_str = f"권장 {rec_w}×{rec_h}px"
                elif min_w and min_h:
                    dim_str = f"최소 {min_w}×{min_h}px"

                ar = p.get("aspect_ratio")
                ar_str = f"{ar[0]}:{ar[1]}" if ar and len(ar) == 2 else ""

                p_copy["dimension_str"] = dim_str
                p_copy["aspect_ratio_str"] = ar_str
                placements_detail.append(p_copy)

            platform_obj = {
                "id": pid,
                "name": PLATFORM_NAMES.get(pid, spec.get("platform", pid)),
                "description": spec.get("description", ""),
                "official_update_date": spec.get("official_update_date", "공식 최신 가이드"),
                "official_source_name": spec.get("official_source_name", "공식 가이드 센터"),
                "official_source_url": spec.get("official_source_url", ""),
                "revision_summary": spec.get("revision_summary", ""),
                "last_verified_date": spec.get("last_verified_date", "2026-11-12"),
                "placements_count": len(placements_detail),
                "placements": [p["name"] for p in placements_detail],
                "placements_detail": placements_detail,
            }
            platforms_meta.append(platform_obj)
        except Exception as err:
            print(f"Error parsing {yaml_path}: {err}")

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(platforms_meta, f, ensure_ascii=False, indent=2)

    total_placements = sum(p["placements_count"] for p in platforms_meta)
    print(f"Successfully synced {len(platforms_meta)} platforms and {total_placements} placements to {OUTPUT_JSON}")


if __name__ == "__main__":
    sync_specs()
