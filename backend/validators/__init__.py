"""Validator registry and exports."""

from typing import Dict, Type
from .base import BaseValidator
from .google_ads import GoogleAdsValidator
from .meta import MetaValidator
from .kakao import KakaoValidator
from .naver import NaverValidator
from .criteo import CriteoValidator
from .rtb_house import RTBHouseValidator
from .appier import AppierValidator
from .adison import AdisonValidator
from .tiktok import TikTokValidator
from .moloco import MolocoValidator
from .twitter import TwitterValidator

VALIDATOR_REGISTRY: Dict[str, Type[BaseValidator]] = {
    "kakao": KakaoValidator,
    "naver": NaverValidator,
    "google_ads": GoogleAdsValidator,
    "meta": MetaValidator,
    "criteo": CriteoValidator,
    "rtb_house": RTBHouseValidator,
    "adison": AdisonValidator,
    "tiktok": TikTokValidator,
    "moloco": MolocoValidator,
    "appier": AppierValidator,
    "twitter": TwitterValidator,
}


def get_validator(platform_id: str) -> BaseValidator:
    """Instantiate and return a validator for the given platform ID."""
    validator_cls = VALIDATOR_REGISTRY.get(platform_id)
    if not validator_cls:
        raise ValueError(f"Unknown platform ID: {platform_id}. Available: {list(VALIDATOR_REGISTRY.keys())}")
    return validator_cls()


__all__ = [
    "BaseValidator",
    "GoogleAdsValidator",
    "MetaValidator",
    "KakaoValidator",
    "NaverValidator",
    "CriteoValidator",
    "RTBHouseValidator",
    "AppierValidator",
    "AdisonValidator",
    "TikTokValidator",
    "MolocoValidator",
    "TwitterValidator",
    "VALIDATOR_REGISTRY",
    "get_validator",
]
