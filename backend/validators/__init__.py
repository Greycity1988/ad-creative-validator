"""Validator registry and exports for all supported ad platforms."""

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
from .daangn import DaangnValidator
from .toss import TossValidator
from .coupang import CoupangValidator
from .buzzvil import BuzzvilValidator


class LinkedInValidator(BaseValidator):
    platform_id = "linkedin"


class PinterestValidator(BaseValidator):
    platform_id = "pinterest"


class SnapchatValidator(BaseValidator):
    platform_id = "snapchat"


class RedditValidator(BaseValidator):
    platform_id = "reddit"


class TaboolaValidator(BaseValidator):
    platform_id = "taboola"


class DableValidator(BaseValidator):
    platform_id = "dable"


class SpotifyValidator(BaseValidator):
    platform_id = "spotify"


class TargetpickValidator(BaseValidator):
    platform_id = "targetpick"


class AcetraderValidator(BaseValidator):
    platform_id = "acetrader"


class CaulyValidator(BaseValidator):
    platform_id = "cauly"


class AdpopcornValidator(BaseValidator):
    platform_id = "adpopcorn"


class OnestoreValidator(BaseValidator):
    platform_id = "onestore"


class SoopValidator(BaseValidator):
    platform_id = "soop"


class ChzzkValidator(BaseValidator):
    platform_id = "chzzk"


class SyrupValidator(BaseValidator):
    platform_id = "syrup"


class TnkValidator(BaseValidator):
    platform_id = "tnk"


class RealclickValidator(BaseValidator):
    platform_id = "realclick"


VALIDATOR_REGISTRY: Dict[str, Type[BaseValidator]] = {
    "acetrader": AcetraderValidator,
    "adison": AdisonValidator,
    "adpopcorn": AdpopcornValidator,
    "appier": AppierValidator,
    "buzzvil": BuzzvilValidator,
    "cauly": CaulyValidator,
    "chzzk": ChzzkValidator,
    "coupang": CoupangValidator,
    "criteo": CriteoValidator,
    "daangn": DaangnValidator,
    "dable": DableValidator,
    "google_ads": GoogleAdsValidator,
    "kakao": KakaoValidator,
    "linkedin": LinkedInValidator,
    "meta": MetaValidator,
    "moloco": MolocoValidator,
    "naver": NaverValidator,
    "onestore": OnestoreValidator,
    "pinterest": PinterestValidator,
    "realclick": RealclickValidator,
    "reddit": RedditValidator,
    "rtb_house": RTBHouseValidator,
    "snapchat": SnapchatValidator,
    "soop": SoopValidator,
    "spotify": SpotifyValidator,
    "syrup": SyrupValidator,
    "taboola": TaboolaValidator,
    "targetpick": TargetpickValidator,
    "tiktok": TikTokValidator,
    "tnk": TnkValidator,
    "toss": TossValidator,
    "twitter": TwitterValidator,
}


def get_validator(platform_id: str) -> BaseValidator:
    """Instantiate and return a validator for the given platform ID."""
    validator_cls = VALIDATOR_REGISTRY.get(platform_id)
    if not validator_cls:
        raise ValueError(f"Unknown platform ID: {platform_id}. Available: {sorted(list(VALIDATOR_REGISTRY.keys()))}")
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
