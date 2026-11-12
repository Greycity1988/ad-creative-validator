"""Smart placement matching based on filename and image dimensions."""

import re
from typing import Any, Dict, List, Optional, Set


def parse_dimensions_from_filename(filename: str) -> Optional[tuple[int, int]]:
    """Extract width and height if filename contains '1200x600', '960_300', etc."""
    pattern = r"(\d{2,4})\s*[_xX×*]\s*(\d{2,4})"
    matches = re.findall(pattern, filename)
    if matches:
        try:
            w, h = int(matches[0][0]), int(matches[0][1])
            if 50 <= w <= 5000 and 50 <= h <= 5000:
                return w, h
        except Exception:
            pass
    return None


def is_placement_matched_by_filename(placement: Dict[str, Any], filename: str) -> bool:
    """Check if the placement is explicitly referenced in the filename."""
    fname_lower = filename.lower()
    pname_lower = placement.get("name", "").lower()

    # 1. Check exact dimension match from filename
    dims = parse_dimensions_from_filename(filename)
    if dims:
        fw, fh = dims
        exact_w = placement.get("exact_width")
        exact_h = placement.get("exact_height")
        min_w = placement.get("min_width")
        min_h = placement.get("min_height")
        rec_w = placement.get("recommended_width")
        rec_h = placement.get("recommended_height")

        # Exact pixel match
        if exact_w == fw and exact_h == fh:
            return True
        if rec_w == fw and rec_h == fh:
            return True
        if min_w == fw and min_h == fh:
            return True

        # Check aspect ratio compatibility with the filename dimensions
        ar = placement.get("aspect_ratio")
        if ar and len(ar) == 2:
            target_ratio = float(ar[0]) / float(ar[1])
            file_ratio = float(fw) / float(fh)
            if abs(file_ratio - target_ratio) / target_ratio <= 0.03:
                # If aspect ratio matches and dimensions are within reasonable bounds
                if min_w and min_h:
                    if fw >= min_w * 0.9 and fh >= min_h * 0.9:
                        return True
                else:
                    return True

        # If filename explicitly specified dimensions, and this placement did not match the dimension or ratio,
        # don't falsely match just because of generic words like "native" or "feed"
        return False

    # 2. Specific product/placement keywords (when no dimension was in filename)
    if "비즈보드" in fname_lower or "bizboard" in fname_lower:
        return "비즈보드" in pname_lower

    if "포커스보드" in fname_lower or "focusboard" in fname_lower:
        if "오브젝트" in fname_lower or "object" in fname_lower or "누끼" in fname_lower:
            return "오브젝트" in pname_lower
        return "포커스보드" in pname_lower and "오브젝트" not in pname_lower

    if "스마트채널" in fname_lower or "smartchannel" in fname_lower:
        return "스마트채널" in pname_lower

    if "모바일da" in fname_lower or "mobile_da" in fname_lower or "모바일_da" in fname_lower:
        return "모바일 da" in pname_lower

    if "타임보드" in fname_lower or "timeboard" in fname_lower:
        return "타임보드" in pname_lower

    if "스페셜da" in fname_lower or "specialda" in fname_lower or "스페셜 da" in fname_lower:
        return "스페셜da" in pname_lower

    if "더블크라운" in fname_lower or "doublecrown" in fname_lower or "double_crown" in fname_lower:
        return "더블크라운" in pname_lower

    if "트리플크라운" in fname_lower or "triplecrown" in fname_lower or "triple_crown" in fname_lower:
        return "트리플크라운" in pname_lower

    if "빅배너" in fname_lower or "bigbanner" in fname_lower or "big_banner" in fname_lower or "플래그십" in fname_lower or "flagship" in fname_lower or "쇼케이스" in fname_lower:
        return "빅배너" in pname_lower

    if "애디슨" in fname_lower or "adison" in fname_lower or "오퍼월" in fname_lower or "offerwall" in fname_lower:
        return "애디슨" in pname_lower

    if "빅쿠폰" in fname_lower or "coupon" in fname_lower:
        return "빅쿠폰" in pname_lower

    if "타이머" in fname_lower or "timer" in fname_lower:
        return "타이머" in pname_lower

    if "프로모보드" in fname_lower or "promoboard" in fname_lower:
        return "프로모보드" in pname_lower

    if "어댑티브" in fname_lower or "adaptive" in fname_lower:
        return "어댑티브" in pname_lower

    if "스태틱" in fname_lower or "static" in fname_lower:
        return "스태틱" in pname_lower

    if "틱톡" in fname_lower or "tiktok" in fname_lower:
        return "틱톡" in pname_lower

    if "몰로코" in fname_lower or "moloco" in fname_lower:
        return "몰로코" in pname_lower

    if "트위터" in fname_lower or "twitter" in fname_lower or "엑스" in fname_lower:
        return "엑스" in pname_lower or "twitter" in pname_lower

    if "당근" in fname_lower or "karrot" in fname_lower or "daangn" in fname_lower:
        return "당근" in pname_lower

    if "토스" in fname_lower or "toss" in fname_lower:
        return "토스" in pname_lower

    if "쿠팡" in fname_lower or "coupang" in fname_lower or "골드박스" in fname_lower:
        return "쿠팡" in pname_lower

    if "버즈빌" in fname_lower or "buzzvil" in fname_lower:
        return "버즈빌" in pname_lower

    if "롤링보드" in fname_lower or "rolling" in fname_lower:
        return "롤링보드" in pname_lower

    if "브랜드검색" in fname_lower or "브검" in fname_lower or "brandsearch" in fname_lower:
        return "브랜드" in pname_lower

    if "밴드" in fname_lower or "band" in fname_lower:
        return "밴드" in pname_lower

    if "채널" in fname_lower or "플친" in fname_lower or "알림톡" in fname_lower:
        return "채널 메시지" in pname_lower

    if "쇼핑" in fname_lower or "shopping" in fname_lower:
        return "쇼핑" in pname_lower

    if "캐러셀" in fname_lower or "carousel" in fname_lower:
        return "carousel" in pname_lower

    if "shorts" in fname_lower or "쇼츠" in fname_lower or "demandgen" in fname_lower:
        return "demand gen" in pname_lower or "9:16" in pname_lower

    if "story" in fname_lower or "스토리" in fname_lower or "reels" in fname_lower or "릴스" in fname_lower:
        return "stories" in pname_lower or "reels" in pname_lower or "9:16" in pname_lower

    # 3. Ratio-specific keywords
    ratio_keywords = {
        "16:5": ["16:5", "16_5"],
        "1.91:1": ["1.91:1", "1.91_1", "16:9"],
        "1:1": ["1:1", "1_1", "square", "정방형"],
        "4:5": ["4:5", "4_5"],
        "9:16": ["9:16", "9_16", "세로형", "vertical"],
        "2:1": ["2:1", "2_1"],
        "2:3": ["2:3", "2_3"],
        "4:3": ["4:3", "4_3"],
    }
    for r_key, kws in ratio_keywords.items():
        if any(kw in fname_lower for kw in kws):
            ar = placement.get("aspect_ratio")
            if ar and len(ar) == 2 and f"{ar[0]}:{ar[1]}" == r_key:
                return True

    return False


def is_placement_matched_by_dimension(placement: Dict[str, Any], width: int, height: int, aspect_ratio_value: float) -> bool:
    """Check if the placement is a plausible target based on image dimensions and ratio."""
    if width <= 0 or height <= 0:
        return False

    exact_w = placement.get("exact_width")
    exact_h = placement.get("exact_height")
    min_w = placement.get("min_width")
    min_h = placement.get("min_height")
    rec_w = placement.get("recommended_width")
    rec_h = placement.get("recommended_height")
    ar = placement.get("aspect_ratio")

    img_ratio = float(width) / float(height)

    # 1. Exact pixel match (100% matched)
    if exact_w is not None and exact_h is not None:
        if exact_w == width and exact_h == height:
            return True
        # Allow tiny deviation (within 3% or 5px) to catch near-misses
        w_diff = abs(width - exact_w)
        h_diff = abs(height - exact_h)
        if w_diff <= max(6, int(exact_w * 0.03)) and h_diff <= max(6, int(exact_h * 0.03)):
            return True

    # 2. Recommended width & height match
    if rec_w is not None and rec_h is not None:
        if rec_w == width and rec_h == height:
            return True
        w_diff = abs(width - rec_w)
        h_diff = abs(height - rec_h)
        if w_diff <= max(6, int(rec_w * 0.03)) and h_diff <= max(6, int(rec_h * 0.03)):
            return True

    # 3. Explicit aspect ratio match
    if ar and len(ar) == 2 and ar[1] != 0:
        target_ratio = float(ar[0]) / float(ar[1])
        ratio_diff = abs(img_ratio - target_ratio) / target_ratio
        # If aspect ratio matches within 3% (distinguishing 2:1 from 1.91:1)
        if ratio_diff <= 0.03:
            # If min dimensions exist, allow images at least 60% of min size (to flag under-resolution)
            if min_w and min_h:
                if width >= min_w * 0.6 and height >= min_h * 0.6:
                    return True
            else:
                return True

    # 4. If placement only specifies exact_w/exact_h, check if the image has the exact same aspect ratio
    # e.g., GDN 300x250 (1.2:1), GDN 160x600 (0.267:1), GDN 120x600 (0.2:1), Naver 750x280 (2.678:1)
    if exact_w is not None and exact_h is not None and exact_h > 0:
        placement_ratio = float(exact_w) / float(exact_h)
        ratio_diff = abs(img_ratio - placement_ratio) / placement_ratio
        # If ratio is very close (within 3.5%) and image dimensions are in the same general ballpark
        if ratio_diff <= 0.035:
            scale_ratio = float(width) / float(exact_w)
            if 0.5 <= scale_ratio <= 3.0:
                return True

    return False
