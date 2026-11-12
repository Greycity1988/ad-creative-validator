"""Text ratio analyzer using EasyOCR and OpenCV."""

import io
import logging
from typing import Optional
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

_READER_INSTANCE = None


def get_ocr_reader():
    """Lazy singleton initializer for EasyOCR Reader."""
    global _READER_INSTANCE
    if _READER_INSTANCE is None:
        try:
            import easyocr
            # Support both Korean and English
            _READER_INSTANCE = easyocr.Reader(["ko", "en"], gpu=False)
        except Exception as e:
            logger.warning("Could not initialize EasyOCR Reader: %s", e)
            return None
    return _READER_INSTANCE


def calculate_text_ratio(image_bytes: bytes) -> Optional[float]:
    """Calculate text area to total image area ratio (0.0 to 1.0).

    Uses EasyOCR to detect text bounding boxes and OpenCV to compute
    the union area without double-counting overlapping regions.
    """
    try:
        import cv2
    except ImportError:
        logger.warning("OpenCV is not available.")
        return 0.0

    reader = get_ocr_reader()
    if reader is None:
        # EasyOCR unavailable
        return 0.0

    try:
        # Load image via Pillow and convert to RGB numpy array
        with Image.open(io.BytesIO(image_bytes)) as pil_img:
            pil_img = pil_img.convert("RGB")
            img_np = np.array(pil_img)

        height, width = img_np.shape[:2]
        if height == 0 or width == 0:
            return 0.0

        # Perform OCR
        results = reader.readtext(img_np)
        if not results:
            return 0.0

        # Create binary mask to calculate union of text bounding boxes
        mask = np.zeros((height, width), dtype=np.uint8)

        for bbox, text, conf in results:
            # bbox is 4 corner points [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
            pts = np.array(bbox, dtype=np.int32)
            cv2.fillPoly(mask, [pts], 255)

        text_pixels = cv2.countNonZero(mask)
        total_pixels = height * width
        ratio = round(float(text_pixels) / float(total_pixels), 4)
        return min(max(ratio, 0.0), 1.0)
    except Exception as e:
        logger.error("Error during text ratio calculation: %s", e)
        return 0.0
