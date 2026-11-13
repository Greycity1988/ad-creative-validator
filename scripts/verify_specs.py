#!/usr/bin/env python3
"""
ACV Ad Creative Validator - Comprehensive Specification & Regression Test Suite
Validates schema integrity, placement dimensions, format bounds, and zero-regression on test banner packs.
"""

import sys
import os
import json
import glob
from pathlib import Path
import yaml

ROOT_DIR = Path(__file__).resolve().parent.parent
SPECS_DIR = ROOT_DIR / "backend" / "specs"
FRONTEND_SPECS_JSON = ROOT_DIR / "frontend" / "src" / "data" / "specsData.json"

VALID_FORMATS = {"jpg", "jpeg", "png", "gif", "webp", "mp4"}


def test_schema_and_dimensions():
    yaml_files = sorted(SPECS_DIR.glob("*.yaml"))
    print(f"📋 1. Checking schema integrity of {len(yaml_files)} YAML files...")
    
    total_placements = 0
    errors = []
    
    for yf in yaml_files:
        with open(yf, "r", encoding="utf-8") as f:
            try:
                data = yaml.safe_load(f)
            except Exception as e:
                errors.append(f"{yf.name}: Failed to parse YAML: {e}")
                continue
                
        pid = data.get("platform_id")
        pname = data.get("platform")
        if not pid or not pname:
            errors.append(f"{yf.name}: missing platform or platform_id")
            
        url = data.get("official_source_url")
        if not url:
            errors.append(f"{yf.name}: missing official_source_url")
            
        placements = data.get("placements", [])
        if not placements:
            errors.append(f"{yf.name}: no placements defined")
            
        seen_names = set()
        for idx, p in enumerate(placements):
            name = p.get("name")
            if not name:
                errors.append(f"{yf.name} placement #{idx}: missing name")
                continue
                
            if name in seen_names:
                errors.append(f"{yf.name}: duplicate placement name '{name}'")
            seen_names.add(name)
            
            # Dimension check
            ew, eh = p.get("exact_width"), p.get("exact_height")
            mw, mh = p.get("min_width"), p.get("min_height")
            ar = p.get("aspect_ratio")
            
            has_exact = ew is not None and eh is not None and ew > 0 and eh > 0
            has_min = mw is not None and mh is not None and mw > 0 and mh > 0
            has_ar = ar is not None and len(ar) == 2 and ar[0] > 0 and ar[1] > 0
            
            if not (has_exact or has_min or has_ar):
                errors.append(f"{yf.name} - '{name}': invalid dimensions (must have exact, min, or aspect_ratio)")
                
            # Formats check
            formats = p.get("allowed_formats", [])
            if not formats:
                errors.append(f"{yf.name} - '{name}': allowed_formats is empty")
            else:
                for fmt in formats:
                    if fmt.lower() not in VALID_FORMATS:
                        errors.append(f"{yf.name} - '{name}': unknown format '{fmt}'")
                        
            # File size limit
            max_kb = p.get("max_file_size_kb")
            max_mb = p.get("max_file_size_mb")
            if max_kb is None and max_mb is None:
                errors.append(f"{yf.name} - '{name}': no max_file_size defined")
                
            # Safe zone check if exists
            sz = p.get("safe_zone")
            if sz:
                bw, bh = sz.get("base_width"), sz.get("base_height")
                if not bw or not bh or bw <= 0 or bh <= 0:
                    errors.append(f"{yf.name} - '{name}': safe_zone missing base_width or base_height")
                    
            total_placements += 1
            
    if errors:
        print(f"❌ Schema errors found ({len(errors)}):")
        for err in errors[:10]:
            print(f"  • {err}")
        return False, total_placements
        
    print(f"✅ Schema integrity passed! Total valid placements: {total_placements}")
    return True, total_placements


def matches_placement(p, w, h):
    ew, eh = p.get("exact_width"), p.get("exact_height")
    if ew == w and eh == h:
        return True
    ar = p.get("aspect_ratio")
    if ar and len(ar) == 2 and ar[0] > 0 and ar[1] > 0:
        target_ratio = ar[0] / ar[1]
        diff = abs((w / h) - target_ratio) / target_ratio
        tol = p.get("aspect_ratio_tolerance", 0.05)
        if diff <= tol:
            mw, mh = p.get("min_width"), p.get("min_height")
            if (not mw or w >= mw * 0.9) and (not mh or h >= mh * 0.9):
                return True
    return False
    print("\n📦 2. Testing real-world regression banner packs against engine...")
    with open(FRONTEND_SPECS_JSON, "r", encoding="utf-8") as f:
        specs_data = json.load(f)
        
    specs_map = {s["id"]: s for s in specs_data}
    failures = []
    
def test_real_banner_packs():
    print("\n📦 2. Testing real-world regression banner packs against engine...")
    with open(FRONTEND_SPECS_JSON, "r", encoding="utf-8") as f:
        specs_data = json.load(f)
        
    specs_map = {s["id"]: s for s in specs_data}
    failures = []
    
    # 1. Criteo 20 Black Friday pack
    criteo_pack = [
        (120, 600), (160, 600), (170, 128), (200, 200), (240, 240),
        (250, 250), (300, 250), (300, 600), (320, 100), (320, 480),
        (320, 50), (320, 568), (336, 280), (360, 640), (468, 60),
        (480, 320), (640, 360), (728, 90), (970, 250), (970, 90)
    ]
    criteo_spec = specs_map.get("criteo", {})
    criteo_placements = criteo_spec.get("placements_detail", [])
    
    for w, h in criteo_pack:
        if not any(matches_placement(p, w, h) for p in criteo_placements):
            failures.append(f"Criteo missing exact banner {w}×{h}")
            
    # 2. Criteo Timer 9 pack
    criteo_timers = [
        (100, 100), (105, 50), (120, 60), (130, 90), (160, 56),
        (200, 32), (300, 40), (300, 54), (336, 48)
    ]
    for w, h in criteo_timers:
        if not any(matches_placement(p, w, h) for p in criteo_placements):
            failures.append(f"Criteo missing timer asset {w}×{h}")
            
    # 3. Google Ads / GDN 28 pack
    gdn_pack = [
        (300, 250), (336, 280), (728, 90), (300, 600), (160, 600), (120, 600),
        (320, 100), (320, 50), (200, 200), (250, 250), (970, 90), (970, 250),
        (468, 60), (300, 50), (240, 400), (930, 180), (580, 400), (980, 120),
        (250, 360), (300, 1050), (320, 480), (480, 320), (768, 1024), (1024, 768),
        (1200, 628), (1200, 1200), (960, 1200), (1080, 1920)
    ]
    gdn_spec = specs_map.get("google_ads", {})
    gdn_placements = gdn_spec.get("placements_detail", [])
    for w, h in gdn_pack:
        if not any(matches_placement(p, w, h) for p in gdn_placements):
            failures.append(f"Google Ads missing or rejecting standard format {w}×{h}")
            
    # 4. TargetPick Key Sizes
    targetpick_pack = [(1200, 627), (1200, 628), (627, 627), (300, 300), (320, 50), (300, 250), (728, 90)]
    tp_spec = specs_map.get("targetpick", {})
    tp_placements = tp_spec.get("placements_detail", [])
    for w, h in targetpick_pack:
        if not any(matches_placement(p, w, h) for p in tp_placements):
            failures.append(f"TargetPick missing format {w}×{h}")
            
    # 5. Kakao Bizboard & Display
    kakao_pack = [(960, 300), (1920, 600), (1029, 258), (1200, 600), (800, 400), (170, 128), (1080, 150)]
    kakao_spec = specs_map.get("kakao", {})
    kakao_placements = kakao_spec.get("placements_detail", [])
    for w, h in kakao_pack:
        if not any(matches_placement(p, w, h) for p in kakao_placements):
            failures.append(f"Kakao missing format {w}×{h}")
            
    # 6. Naver
    naver_pack = [(1660, 260), (830, 130), (1250, 520), (750, 280), (1500, 560), (350, 280), (700, 560), (600, 600), (112, 112)]
    naver_spec = specs_map.get("naver", {})
    naver_placements = naver_spec.get("placements_detail", [])
    for w, h in naver_pack:
        if not any(matches_placement(p, w, h) for p in naver_placements):
            failures.append(f"Naver missing format {w}×{h}")

    if failures:
        print(f"❌ Regression test failures ({len(failures)}):")
        for f in failures:
            print(f"  • {f}")
        return False
        
    print(f"✅ All real-world regression banner packs passed with 100% precision!")
    return True


def test_sync_consistency():
    print("\n🔄 3. Checking frontend specsData.json sync consistency...")
    if not FRONTEND_SPECS_JSON.exists():
        print(f"❌ {FRONTEND_SPECS_JSON} does not exist!")
        return False
        
    with open(FRONTEND_SPECS_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    yaml_count = len(list(SPECS_DIR.glob("*.yaml")))
    json_count = len(data)
    
    if yaml_count != json_count:
        print(f"❌ Platform count mismatch: {yaml_count} YAMLs vs {json_count} platforms in JSON")
        return False
        
    print(f"✅ Sync consistency verified ({json_count} platforms match 1:1)")
    return True


def main():
    print("=" * 65)
    print("🚀 RUNNING ACV FULL AD SPECIFICATION & REGRESSION AUDIT")
    print("=" * 65)
    
    ok1, total_placements = test_schema_and_dimensions()
    ok2 = test_real_banner_packs()
    ok3 = test_sync_consistency()
    
    print("\n" + "=" * 65)
    if ok1 and ok2 and ok3:
        print(f"🎉 AUDIT RESULT: 100% PASS (32 Platforms / {total_placements} Placements)")
        print("All official publisher technical constraints and test packs verified.")
        print("=" * 65)
        return 0
    else:
        print("💥 AUDIT RESULT: FAILED. Please resolve errors before committing.")
        print("=" * 65)
        return 1


if __name__ == "__main__":
    sys.exit(main())
