"""Report generation router."""

import logging
from urllib.parse import quote
from fastapi import APIRouter, HTTPException, Response

from exporters.excel import generate_excel_report
from models.schemas import ReportRequest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/report", tags=["report"])


@router.post("/excel")
async def export_excel_report(request: ReportRequest):
    """Generate and download an Excel report from validation results."""
    if not request.results:
        raise HTTPException(status_code=400, detail="No validation results provided to export.")

    try:
        excel_stream = generate_excel_report(request.results)
        excel_bytes = excel_stream.getvalue()

        filename = "광고소재_검수결과_리포트.xlsx"
        encoded_filename = quote(filename)

        headers = {
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}",
            "Access-Control-Expose-Headers": "Content-Disposition",
        }

        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers=headers,
        )
    except Exception as e:
        logger.error("Failed to generate Excel report: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to generate Excel report: {str(e)}")
