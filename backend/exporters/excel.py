"""Excel report generator using openpyxl."""

import io
from datetime import datetime
from typing import List
import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

from models.schemas import ImageValidationResult


HEADER_FILL = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")  # Dark Blue
SECTION_FILL = PatternFill(start_color="3B82F6", end_color="3B82F6", fill_type="solid")  # Accent Blue
PASS_FILL = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")     # Light green
FAIL_FILL = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid")     # Light red
WARN_FILL = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")     # Light yellow
GRAY_FILL = PatternFill(start_color="F3F4F6", end_color="F3F4F6", fill_type="solid")

HEADER_FONT = Font(name="Malgun Gothic", size=11, bold=True, color="FFFFFF")
TITLE_FONT = Font(name="Malgun Gothic", size=16, bold=True, color="1E3A8A")
BOLD_FONT = Font(name="Malgun Gothic", size=10, bold=True)
REGULAR_FONT = Font(name="Malgun Gothic", size=10)

PASS_FONT = Font(name="Malgun Gothic", size=10, bold=True, color="15803D")
FAIL_FONT = Font(name="Malgun Gothic", size=10, bold=True, color="B91C1C")
WARN_FONT = Font(name="Malgun Gothic", size=10, bold=True, color="B45309")

THIN_BORDER = Border(
    left=Side(style="thin", color="D1D5DB"),
    right=Side(style="thin", color="D1D5DB"),
    top=Side(style="thin", color="D1D5DB"),
    bottom=Side(style="thin", color="D1D5DB"),
)


def _apply_status_style(cell, status_str: str):
    s = (status_str or "").lower()
    if s in ("pass", "합격"):
        cell.fill = PASS_FILL
        cell.font = PASS_FONT
    elif s in ("fail", "불합격"):
        cell.fill = FAIL_FILL
        cell.font = FAIL_FONT
    elif s in ("warning", "partial", "경고", "부분합격"):
        cell.fill = WARN_FILL
        cell.font = WARN_FONT
    else:
        cell.fill = GRAY_FILL
        cell.font = REGULAR_FONT


def _auto_adjust_columns(ws, min_width=12, max_width=45):
    for col in ws.columns:
        col_letter = get_column_letter(col[0].column)
        max_len = 0
        for cell in col:
            val_str = str(cell.value or "")
            # Korean characters take ~2 width
            val_len = sum(2 if ord(c) > 127 else 1 for c in val_str)
            if val_len > max_len:
                max_len = val_len
        ws.column_dimensions[col_letter].width = min(max(max_len + 3, min_width), max_width)


def generate_excel_report(results: List[ImageValidationResult]) -> io.BytesIO:
    """Generate a formatted Excel (.xlsx) report from validation results."""
    wb = openpyxl.Workbook()

    # -------------------------------------------------------------
    # Sheet 1: Summary (검수 요약)
    # -------------------------------------------------------------
    ws_summary = wb.active
    ws_summary.title = "검수 요약"
    ws_summary.views.sheetView[0].showGridLines = True

    # Title
    ws_summary.cell(row=2, column=2, value="광고 소재 가이드라인 검수 결과 보고서").font = TITLE_FONT
    ws_summary.cell(
        row=3,
        column=2,
        value=f"생성 일시: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | 총 검수 이미지: {len(results)}건",
    ).font = REGULAR_FONT

    # Header Row
    headers = [
        "파일명",
        "해상도",
        "비율",
        "용량(KB)",
        "포맷",
        "알파채널",
        "텍스트 비율",
    ]

    # Collect unique platform names
    all_platforms = []
    for r in results:
        for p in r.platform_results:
            if p.platform not in all_platforms:
                all_platforms.append(p.platform)

    full_headers = headers + [f"{p} 결과" for p in all_platforms]

    start_row = 5
    for c_idx, h in enumerate(full_headers, start=2):
        cell = ws_summary.cell(row=start_row, column=c_idx, value=h)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = THIN_BORDER

    current_row = start_row + 1
    for item in results:
        info = item.image_info
        text_ratio_str = f"{item.text_ratio * 100:.1f}%" if item.text_ratio is not None else "미검사"
        alpha_str = "있음(투명)" if info.has_alpha else "없음"

        row_data = [
            item.filename,
            f"{info.width}×{info.height}",
            info.aspect_ratio,
            f"{info.file_size_kb:.1f}",
            info.format,
            alpha_str,
            text_ratio_str,
        ]

        # Base info
        for c_idx, val in enumerate(row_data, start=2):
            cell = ws_summary.cell(row=current_row, column=c_idx, value=val)
            cell.font = REGULAR_FONT
            cell.alignment = Alignment(horizontal="center", vertical="center")
            cell.border = THIN_BORDER

        # Platform status
        p_map = {p.platform: (p.overall or "pass").upper() for p in item.platform_results}
        for p_idx, p_name in enumerate(all_platforms):
            c_idx = len(headers) + 2 + p_idx
            status_text = p_map.get(p_name, "N/A")
            cell = ws_summary.cell(row=current_row, column=c_idx, value=status_text)
            cell.alignment = Alignment(horizontal="center", vertical="center")
            cell.border = THIN_BORDER
            _apply_status_style(cell, status_text)

        current_row += 1

    _auto_adjust_columns(ws_summary)

    # -------------------------------------------------------------
    # Sheet 2: Detailed Results (상세 검수 내역)
    # -------------------------------------------------------------
    ws_detail = wb.create_sheet(title="상세 검수 내역")
    ws_detail.views.sheetView[0].showGridLines = True

    detail_headers = [
        "파일명",
        "플랫폼",
        "광고 지면(배치)",
        "지면 판정",
        "검사 항목",
        "항목 판정",
        "기준 요건",
        "소재 실측값",
        "상세 설명",
    ]

    for c_idx, h in enumerate(detail_headers, start=1):
        cell = ws_detail.cell(row=1, column=c_idx, value=h)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = THIN_BORDER

    detail_row = 2
    for item in results:
        for p in item.platform_results:
            for pl in p.placements:
                for ck in pl.checks:
                    ws_detail.cell(row=detail_row, column=1, value=item.filename).alignment = Alignment(horizontal="center", vertical="center")
                    ws_detail.cell(row=detail_row, column=2, value=p.platform).alignment = Alignment(horizontal="center", vertical="center")
                    ws_detail.cell(row=detail_row, column=3, value=pl.name).alignment = Alignment(horizontal="left", vertical="center")

                    # Placement overall
                    c4 = ws_detail.cell(row=detail_row, column=4, value=pl.overall.upper())
                    c4.alignment = Alignment(horizontal="center", vertical="center")
                    _apply_status_style(c4, pl.overall)

                    ws_detail.cell(row=detail_row, column=5, value=ck.name).alignment = Alignment(horizontal="center", vertical="center")

                    # Check status
                    c6 = ws_detail.cell(row=detail_row, column=6, value=ck.status.upper())
                    c6.alignment = Alignment(horizontal="center", vertical="center")
                    _apply_status_style(c6, ck.status)

                    ws_detail.cell(row=detail_row, column=7, value=ck.expected or "-").alignment = Alignment(horizontal="center", vertical="center")
                    ws_detail.cell(row=detail_row, column=8, value=ck.actual or "-").alignment = Alignment(horizontal="center", vertical="center")
                    ws_detail.cell(row=detail_row, column=9, value=ck.message).alignment = Alignment(horizontal="left", vertical="center")

                    for c in range(1, 10):
                        ws_detail.cell(row=detail_row, column=c).border = THIN_BORDER
                        if c not in (4, 6):
                            ws_detail.cell(row=detail_row, column=c).font = REGULAR_FONT

                    detail_row += 1

    _auto_adjust_columns(ws_detail)

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    return output
