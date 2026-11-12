"""Base validator class for ad platform specifications."""

from abc import ABC
from pathlib import Path
from typing import Any, Dict, List, Optional
import yaml

from models.schemas import CheckResult, CheckStatus, ImageInfo, PlacementResult, PlatformResult
from analyzers.target_matcher import is_placement_matched_by_filename, is_placement_matched_by_dimension


SPECS_DIR = Path(__file__).resolve().parent.parent / "specs"


class BaseValidator(ABC):
    """Abstract base validator that reads YAML specs and evaluates images."""

    platform_id: str = ""

    def __init__(self, spec_path: Optional[Path] = None):
        if spec_path is None:
            spec_path = SPECS_DIR / f"{self.platform_id}.yaml"
        self.spec_path = spec_path
        self.spec: Dict[str, Any] = self._load_spec()
        self.platform_name: str = self.spec.get("platform", self.platform_id)

    def _load_spec(self) -> Dict[str, Any]:
        if not self.spec_path.exists():
            raise FileNotFoundError(f"Spec file not found: {self.spec_path}")
        with open(self.spec_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)

    def validate(
        self,
        image_info: ImageInfo,
        text_ratio: Optional[float] = None,
        target_placements: Optional[List[str]] = None,
        filename: str = "",
        auto_match: bool = True,
    ) -> PlatformResult:
        """Validate an image against placements in this platform spec."""
        placements = self.spec.get("placements", [])
        
        # 1. If user explicitly specified target placements for this platform, filter them
        if target_placements:
            target_set = {p.strip().lower() for p in target_placements}
            selected_placements = [p for p in placements if p.get("name", "").strip().lower() in target_set]
            if selected_placements:
                placements = selected_placements
        elif auto_match:
            # 2. Smart auto-match: only evaluate placements that match the image's dimensions, ratio, or filename
            matched_spec_placements = []
            for p in placements:
                is_match = False
                if filename:
                    is_match = is_placement_matched_by_filename(p, filename)
                if not is_match:
                    is_match = is_placement_matched_by_dimension(
                        p, image_info.width, image_info.height, image_info.aspect_ratio_value
                    )
                if is_match:
                    matched_spec_placements.append(p)

            if matched_spec_placements:
                # If there are exact pixel matches among candidates, prioritize exact pixel matches
                exact_matches = [
                    p for p in matched_spec_placements
                    if p.get("exact_width") == image_info.width and p.get("exact_height") == image_info.height
                ]
                if exact_matches:
                    placements = exact_matches
                else:
                    placements = matched_spec_placements
            else:
                # No placement in this platform matches the uploaded image size
                return PlatformResult(
                    platform=self.platform_name,
                    platform_id=self.platform_id,
                    overall="na",
                    placements=[
                        PlacementResult(
                            name=f"호환 규격 지면 없음 ({image_info.width}×{image_info.height}px)",
                            overall="skip",
                            checks=[
                                CheckResult(
                                    name="target_match",
                                    status=CheckStatus.SKIP.value,
                                    message=f"업로드된 이미지 규격({image_info.width}×{image_info.height}px, {image_info.aspect_ratio})에 해당하는 {self.platform_name} 공식 지면이 없습니다.",
                                    expected="호환 규격 지면",
                                    actual=f"{image_info.width}×{image_info.height}px",
                                )
                            ],
                            is_matched_target=False,
                        )
                    ],
                )

        placement_results: List[PlacementResult] = []
        for placement in placements:
            p_result = self._validate_placement(placement, image_info, text_ratio, filename=filename)
            placement_results.append(p_result)

        overall = self._calculate_platform_overall(placement_results)

        return PlatformResult(
            platform=self.platform_name,
            platform_id=self.platform_id,
            overall=overall,
            placements=placement_results,
        )

    def _validate_placement(
        self,
        placement: Dict[str, Any],
        image_info: ImageInfo,
        text_ratio: Optional[float],
        filename: str = "",
    ) -> PlacementResult:
        checks: List[CheckResult] = []

        # 1. Format check
        checks.append(self._check_format(placement, image_info))

        # 2. Dimensions check
        checks.append(self._check_dimensions(placement, image_info))

        # 3. File size check
        checks.append(self._check_file_size(placement, image_info))

        # 4. Aspect ratio check
        ar_check = self._check_aspect_ratio(placement, image_info)
        if ar_check:
            checks.append(ar_check)

        # 5. Transparency check
        trans_check = self._check_transparency(placement, image_info)
        if trans_check:
            checks.append(trans_check)

        # 6. Text ratio check
        if text_ratio is not None:
            tr_check = self._check_text_ratio(placement, text_ratio)
            if tr_check:
                checks.append(tr_check)

        # Determine overall placement status
        has_fail = any(c.status == CheckStatus.FAIL.value for c in checks)
        has_warning = any(c.status == CheckStatus.WARNING.value for c in checks)

        if has_fail:
            overall = CheckStatus.FAIL.value
        elif has_warning:
            overall = CheckStatus.WARNING.value
        else:
            overall = CheckStatus.PASS.value

        # Determine if this placement matches filename keywords or image dimensions
        is_matched = False
        if filename:
            is_matched = is_placement_matched_by_filename(placement, filename)
        if not is_matched:
            is_matched = is_placement_matched_by_dimension(
                placement, image_info.width, image_info.height, image_info.aspect_ratio_value
            )

        return PlacementResult(
            name=placement.get("name", "Unknown Placement"),
            overall=overall,
            checks=checks,
            is_matched_target=is_matched,
        )

    def _check_format(self, placement: Dict[str, Any], image_info: ImageInfo) -> CheckResult:
        allowed = [fmt.lower() for fmt in placement.get("allowed_formats", ["jpg", "jpeg", "png"])]
        # Normalize jpg/jpeg
        if "jpeg" in allowed and "jpg" not in allowed:
            allowed.append("jpg")
        elif "jpg" in allowed and "jpeg" not in allowed:
            allowed.append("jpeg")

        actual_fmt = image_info.format.lower()
        if actual_fmt in allowed:
            return CheckResult(
                name="format",
                status=CheckStatus.PASS.value,
                message=f"{image_info.format} 형식 허용",
                expected=", ".join(placement.get("allowed_formats", [])).upper(),
                actual=image_info.format,
            )
        else:
            return CheckResult(
                name="format",
                status=CheckStatus.FAIL.value,
                message=f"지원하지 않는 형식: {image_info.format} (허용: {', '.join(placement.get('allowed_formats', [])).upper()})",
                expected=", ".join(placement.get("allowed_formats", [])).upper(),
                actual=image_info.format,
            )

    def _check_dimensions(self, placement: Dict[str, Any], image_info: ImageInfo) -> CheckResult:
        exact_w = placement.get("exact_width")
        exact_h = placement.get("exact_height")
        min_w = placement.get("min_width")
        min_h = placement.get("min_height")
        rec_w = placement.get("recommended_width")
        rec_h = placement.get("recommended_height")

        w, h = image_info.width, image_info.height

        if exact_w is not None and exact_h is not None:
            if w == exact_w and h == exact_h:
                return CheckResult(
                    name="dimensions",
                    status=CheckStatus.PASS.value,
                    message=f"해상도 일치: {w}×{h}px",
                    expected=f"{exact_w}×{exact_h}px",
                    actual=f"{w}×{h}px",
                )
            else:
                return CheckResult(
                    name="dimensions",
                    status=CheckStatus.FAIL.value,
                    message=f"해상도 불일치: {w}×{h}px (요구: {exact_w}×{exact_h}px)",
                    expected=f"{exact_w}×{exact_h}px",
                    actual=f"{w}×{h}px",
                )

        if min_w is not None and min_h is not None:
            if w >= min_w and h >= min_h:
                msg = f"{w}×{h}px ≥ 최소 {min_w}×{min_h}px"
                if rec_w and rec_h and (w < rec_w or h < rec_h):
                    msg += f" (권장: {rec_w}×{rec_h}px)"
                return CheckResult(
                    name="dimensions",
                    status=CheckStatus.PASS.value,
                    message=msg,
                    expected=f"최소 {min_w}×{min_h}px",
                    actual=f"{w}×{h}px",
                )
            else:
                return CheckResult(
                    name="dimensions",
                    status=CheckStatus.FAIL.value,
                    message=f"최소 해상도 미달: {w}×{h}px (최소: {min_w}×{min_h}px)",
                    expected=f"최소 {min_w}×{min_h}px",
                    actual=f"{w}×{h}px",
                )

        return CheckResult(
            name="dimensions",
            status=CheckStatus.PASS.value,
            message=f"해상도 확인: {w}×{h}px",
            expected="규정 없음",
            actual=f"{w}×{h}px",
        )

    def _check_file_size(self, placement: Dict[str, Any], image_info: ImageInfo) -> CheckResult:
        max_kb = placement.get("max_file_size_kb")
        min_kb = placement.get("min_file_size_kb")
        actual_kb = image_info.file_size_kb

        if max_kb is not None and actual_kb > max_kb:
            return CheckResult(
                name="file_size",
                status=CheckStatus.FAIL.value,
                message=f"용량 초과: {actual_kb}KB > 최대 {max_kb}KB",
                expected=f"최대 {max_kb}KB",
                actual=f"{actual_kb}KB",
            )

        if min_kb is not None and actual_kb < min_kb:
            return CheckResult(
                name="file_size",
                status=CheckStatus.FAIL.value,
                message=f"최소 용량 미달: {actual_kb}KB < 최소 {min_kb}KB",
                expected=f"최소 {min_kb}KB",
                actual=f"{actual_kb}KB",
            )

        expected_str = ""
        if min_kb and max_kb:
            expected_str = f"{min_kb}KB ~ {max_kb}KB"
        elif max_kb:
            expected_str = f"최대 {max_kb}KB"

        return CheckResult(
            name="file_size",
            status=CheckStatus.PASS.value,
            message=f"{actual_kb}KB ≤ {max_kb}KB" if max_kb else f"{actual_kb}KB (규정 충족)",
            expected=expected_str,
            actual=f"{actual_kb}KB",
        )

    def _check_aspect_ratio(self, placement: Dict[str, Any], image_info: ImageInfo) -> Optional[CheckResult]:
        ar = placement.get("aspect_ratio")
        if not ar or len(ar) != 2:
            # If exact dimensions are specified without explicit aspect_ratio, aspect ratio is implicitly checked by dimensions
            return None

        target_ratio = float(ar[0]) / float(ar[1])
        tolerance = float(placement.get("aspect_ratio_tolerance", 0.02))
        actual_ratio = image_info.aspect_ratio_value

        diff = abs(actual_ratio - target_ratio) / target_ratio
        ratio_str = f"{ar[0]}:{ar[1]}"

        if diff <= tolerance:
            return CheckResult(
                name="aspect_ratio",
                status=CheckStatus.PASS.value,
                message=f"{ratio_str} 일치 ({image_info.aspect_ratio})",
                expected=ratio_str,
                actual=image_info.aspect_ratio,
            )
        else:
            return CheckResult(
                name="aspect_ratio",
                status=CheckStatus.FAIL.value,
                message=f"비율 불일치: {image_info.aspect_ratio} ≠ {ratio_str}",
                expected=ratio_str,
                actual=image_info.aspect_ratio,
            )

    def _check_transparency(self, placement: Dict[str, Any], image_info: ImageInfo) -> Optional[CheckResult]:
        require_trans = placement.get("require_transparency", False)
        if not require_trans:
            return None

        if image_info.has_alpha:
            return CheckResult(
                name="transparency",
                status=CheckStatus.PASS.value,
                message="투명 배경 확인됨",
                expected="투명 배경 필요 (PNG)",
                actual="투명 배경 적용됨",
            )
        else:
            return CheckResult(
                name="transparency",
                status=CheckStatus.FAIL.value,
                message="투명 배경(PNG) 필수이나 투명 영역이 없음",
                expected="투명 배경 필요 (PNG)",
                actual="불투명 또는 알파 채널 없음",
            )

    def _check_text_ratio(self, placement: Dict[str, Any], text_ratio: float) -> Optional[CheckResult]:
        limit = placement.get("text_ratio_limit")
        if limit is None:
            return None

        level = placement.get("text_ratio_level", "warning").lower()
        pct_actual = round(text_ratio * 100, 1)
        pct_limit = round(limit * 100, 0)

        if text_ratio <= limit:
            return CheckResult(
                name="text_ratio",
                status=CheckStatus.PASS.value,
                message=f"텍스트 비율 {pct_actual}% ≤ 기준 {pct_limit:.0f}%",
                expected=f"최대 {pct_limit:.0f}%",
                actual=f"{pct_actual}%",
            )
        else:
            status = CheckStatus.WARNING.value if level == "warning" else CheckStatus.FAIL.value
            return CheckResult(
                name="text_ratio",
                status=status,
                message=f"텍스트 비율 기준 초과: {pct_actual}% > {pct_limit:.0f}% ({'경고' if level == 'warning' else '불가'})",
                expected=f"최대 {pct_limit:.0f}%",
                actual=f"{pct_actual}%",
            )

    def _calculate_platform_overall(self, placement_results: List[PlacementResult]) -> str:
        if not placement_results:
            return "na"

        active = [p for p in placement_results if p.overall not in ("skip", "na")]
        if not active:
            return "na"

        statuses = [p.overall for p in active]
        if all(s in ("pass", "success") for s in statuses):
            return "pass"
        if all(s in ("fail", "error") for s in statuses):
            return "fail"
        return "partial"
