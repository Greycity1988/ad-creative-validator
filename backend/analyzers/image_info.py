"""Image metadata extraction using Pillow."""

import io
from typing import Tuple
from PIL import Image

from models.schemas import ImageInfo


COMMON_RATIOS = [
    ((1.91, 1.0), "1.91:1"),
    ((1.0, 1.0), "1:1"),
    ((4.0, 5.0), "4:5"),
    ((9.0, 16.0), "9:16"),
    ((16.0, 9.0), "16:9"),
    ((2.0, 1.0), "2:1"),
    ((2.0, 3.0), "2:3"),
    ((16.0, 5.0), "16:5"),
    ((4.0, 3.0), "4:3"),
    ((3.0, 2.0), "3:2"),
]


def detect_aspect_ratio_str(width: int, height: int, tolerance: float = 0.03) -> Tuple[str, float]:
    """Detect common aspect ratio string or format as X.XX:1."""
    if height == 0:
        return "0:0", 0.0
    val = width / height
    for (rw, rh), label in COMMON_RATIOS:
        target = rw / rh
        if abs(val - target) / target <= tolerance:
            return label, round(val, 4)
    return f"{round(val, 2)}:1", round(val, 4)


def check_has_alpha(img: Image.Image) -> bool:
    """Check if the image contains an alpha/transparency channel."""
    if img.mode in ("RGBA", "LA"):
        return True
    if "A" in img.getbands():
        return True
    if img.mode == "P" and "transparency" in img.info:
        return True
    return False


def extract_image_info(filename: str, content: bytes) -> ImageInfo:
    """Extract metadata from raw image bytes."""
    with Image.open(io.BytesIO(content)) as img:
        width, height = img.size
        img_format = (img.format or "").upper()
        # Normalization
        if img_format == "JPEG":
            img_format = "JPG"
        has_alpha = check_has_alpha(img)

    file_size_kb = round(len(content) / 1024, 2)
    ratio_str, ratio_val = detect_aspect_ratio_str(width, height)

    return ImageInfo(
        width=width,
        height=height,
        format=img_format,
        file_size_kb=file_size_kb,
        has_alpha=has_alpha,
        aspect_ratio=ratio_str,
        aspect_ratio_value=ratio_val,
    )
