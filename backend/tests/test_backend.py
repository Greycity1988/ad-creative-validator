"""Automated test suite for ad creative validator backend."""

import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient

from main import app
from analyzers.image_info import extract_image_info
from exporters.excel import generate_excel_report
from models.schemas import CheckStatus, ImageValidationResult
from validators import VALIDATOR_REGISTRY, get_validator


client = TestClient(app)


def create_test_image(
    width: int,
    height: int,
    fmt: str = "PNG",
    mode: str = "RGB",
    color: tuple = (255, 0, 0),
) -> bytes:
    """Helper to generate in-memory dummy test images."""
    if mode == "RGBA":
        color = (*color[:3], 128)
    img = Image.new(mode, (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return buf.getvalue()


def test_registry_has_all_platforms():
    expected = {
        "google_ads",
        "meta",
        "kakao",
        "naver",
        "criteo",
        "rtb_house",
        "appier",
        "adison",
        "tiktok",
        "moloco",
        "twitter",
    }
    assert expected.issubset(set(VALIDATOR_REGISTRY.keys()))
    for pid in expected:
        v = get_validator(pid)
        assert len(v.spec.get("placements", [])) > 0


def test_image_info_extraction():
    # 1200x628 Landscape PNG
    data = create_test_image(1200, 628, fmt="PNG", mode="RGB")
    info = extract_image_info("test.png", data)
    assert info.width == 1200
    assert info.height == 628
    assert info.format == "PNG"
    assert info.has_alpha is False
    assert info.aspect_ratio == "1.91:1"
    assert round(info.aspect_ratio_value, 2) == 1.91

    # Kakao BizBoard 960x300 Transparent PNG
    data_alpha = create_test_image(960, 300, fmt="PNG", mode="RGBA")
    info_alpha = extract_image_info("bizboard.png", data_alpha)
    assert info_alpha.width == 960
    assert info_alpha.height == 300
    assert info_alpha.has_alpha is True
    assert info_alpha.aspect_ratio == "16:5"


def test_kakao_bizboard_validation():
    # Valid BizBoard image
    v = get_validator("kakao")
    data = create_test_image(960, 300, fmt="PNG", mode="RGBA")
    info = extract_image_info("bizboard.png", data)
    res = v.validate(info)

    biz_res = next(p for p in res.placements if "비즈보드" in p.name)
    assert biz_res.overall == CheckStatus.PASS.value

    # Invalid BizBoard image (JPEG without alpha)
    data_invalid = create_test_image(960, 300, fmt="JPEG", mode="RGB")
    info_invalid = extract_image_info("bizboard.jpg", data_invalid)
    res_invalid = v.validate(info_invalid)
    biz_invalid = next(p for p in res_invalid.placements if "비즈보드" in p.name)
    assert biz_invalid.overall == CheckStatus.FAIL.value


def test_naver_gfa_validation():
    v = get_validator("naver")
    # 1200x1200 Square Feed
    data = create_test_image(1200, 1200, fmt="PNG", mode="RGB")
    info = extract_image_info("naver_sq.png", data)
    res = v.validate(info, text_ratio=0.15)
    sq_res = next(p for p in res.placements if "Square" in p.name)
    # File size min_file_size_kb is 80KB in naver spec; our blank dummy image is smaller so file_size fails
    file_size_check = next(c for c in sq_res.checks if c.name == "file_size")
    assert file_size_check.status == CheckStatus.FAIL.value
    # But dimensions, aspect_ratio, format pass
    dim_check = next(c for c in sq_res.checks if c.name == "dimensions")
    assert dim_check.status == CheckStatus.PASS.value


def test_api_validate_endpoint():
    # Test POST /api/validate with multipart form
    img_data = create_test_image(1200, 628, fmt="PNG")
    response = client.post(
        "/api/validate",
        files={"files": ("test_banner.png", img_data, "image/png")},
        data={"platforms": '["google_ads", "meta"]', "analyze_text": "false"},
    )
    assert response.status_code == 200
    json_data = response.json()
    assert "results" in json_data
    assert len(json_data["results"]) == 1
    r = json_data["results"][0]
    assert r["filename"] == "test_banner.png"
    assert r["image_info"]["width"] == 1200
    assert r["image_info"]["height"] == 628
    assert len(r["platform_results"]) == 2


def test_api_report_excel_endpoint():
    img_data = create_test_image(1200, 628, fmt="PNG")
    info = extract_image_info("test.png", img_data)
    v = get_validator("google_ads")
    p_res = v.validate(info)

    item = ImageValidationResult(
        filename="test.png",
        image_info=info,
        text_ratio=0.12,
        platform_results=[p_res],
    )

    response = client.post(
        "/api/report/excel",
        json={"results": [item.model_dump()]},
    )
    assert response.status_code == 200
    assert (
        response.headers["content-type"]
        == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    assert len(response.content) > 1000


def test_smart_auto_matching_dimension_filtering():
    """Verify that a 1200x600 image matches only 2:1 placements in Kakao, and 120x600 is N/A in Kakao."""
    v_kakao = get_validator("kakao")
    v_google = get_validator("google_ads")

    # 1. 1200x600 image (2:1 aspect ratio)
    img_2to1 = create_test_image(1200, 600, fmt="JPEG")
    info_2to1 = extract_image_info("creative_1200x600.jpg", img_2to1)

    kakao_res = v_kakao.validate(info_2to1, auto_match=True)
    # Placements should only include 2:1 placements, NOT 960x300 or 1504x336
    placement_names = [p.name for p in kakao_res.placements]
    assert any("2:1" in name for name in placement_names)
    assert not any("960×300" in name for name in placement_names)
    assert not any("1504×336" in name for name in placement_names)

    # 2. 120x600 image (Skyscraper)
    img_sky = create_test_image(120, 600, fmt="PNG")
    info_sky = extract_image_info("skyscraper.png", img_sky)

    # In Kakao, 120x600 should be marked 'na' because Kakao has no 120x600 placements
    kakao_sky_res = v_kakao.validate(info_sky, auto_match=True)
    assert kakao_sky_res.overall == "na"

    # In Google Ads, 120x600 matches GDN Skyscraper
    google_sky_res = v_google.validate(info_sky, auto_match=True)
    assert any("120×600" in p.name for p in google_sky_res.placements)
    assert google_sky_res.overall == CheckStatus.PASS.value


def test_naver_timeboard_and_specialda():
    """Verify Naver Timeboard (1660x260) and SpecialDA (1250x520) validation."""
    v_naver = get_validator("naver")

    # Timeboard 1660x260
    img_tb = create_test_image(1660, 260, fmt="JPEG")
    info_tb = extract_image_info("timeboard.jpg", img_tb)
    res_tb = v_naver.validate(info_tb, auto_match=True)
    assert any("타임보드" in p.name for p in res_tb.placements)
    assert res_tb.overall == CheckStatus.PASS.value

    # Special DA 1250x520
    img_sda = create_test_image(1250, 520, fmt="PNG")
    info_sda = extract_image_info("special_da.png", img_sda)
    res_sda = v_naver.validate(info_sda, auto_match=True)
    assert any("스페셜DA" in p.name for p in res_sda.placements)
    assert res_sda.overall == CheckStatus.PASS.value


def test_criteo_big_banner():
    """Verify Criteo Flagship Big Banner (576x300) validation."""
    v_criteo = get_validator("criteo")
    img_bb = create_test_image(576, 300, fmt="PNG")
    info_bb = extract_image_info("criteo_flagship_big_banner.png", img_bb)
    res_bb = v_criteo.validate(info_bb, auto_match=True)
    assert any("576×300" in p.name for p in res_bb.placements)
    assert res_bb.overall == CheckStatus.PASS.value


def test_criteo_iab_and_timer_banners():
    """Verify Criteo Standard IAB display banners and timer/coupon banners."""
    v_criteo = get_validator("criteo")

    # Standard IAB 300x250
    img_300 = create_test_image(300, 250, fmt="JPEG")
    info_300 = extract_image_info("banner_300x250.jpg", img_300)
    res_300 = v_criteo.validate(info_300, auto_match=True)
    assert any("300×250" in p.name for p in res_300.placements)
    assert res_300.overall == CheckStatus.PASS.value

    # Skyscraper 160x600
    img_160 = create_test_image(160, 600, fmt="PNG")
    info_160 = extract_image_info("criteo_160x600.png", img_160)
    res_160 = v_criteo.validate(info_160, auto_match=True)
    assert any("160×600" in p.name for p in res_160.placements)
    assert res_160.overall == CheckStatus.PASS.value


def test_feedback_api():
    """Verify feedback list and feedback submission API."""
    # 1. GET feedbacks
    res_get = client.get("/api/feedbacks")
    assert res_get.status_code == 200
    items = res_get.json()
    assert isinstance(items, list)
    assert len(items) >= 1

    # 2. POST feedback
    new_data = {
        "title": "테스트 자동화 피드백",
        "category": "신규 매체 추가",
        "content": "테스트용 신규 매체 건의 내용입니다.",
        "author": "테스터",
    }
    res_post = client.post("/api/feedbacks", json=new_data)
    assert res_post.status_code == 200
    created = res_post.json()
    assert created["title"] == new_data["title"]
    assert created["status"] == "검토 중"


def test_alphabetical_platforms_order():
    """Verify platforms are returned in strict alphabetical order."""
    res = client.get("/api/platforms")
    assert res.status_code == 200
    platforms = res.json()["platforms"]
    pids = [p["id"] for p in platforms]
    assert pids == sorted(pids)

