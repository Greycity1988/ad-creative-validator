#!/usr/bin/env python3
"""
ACV Official Publisher Specification Monitoring Engine
Periodically inspects official ad platform guidelines, detects changes,
and alerts maintainers to keep specifications 100% up-to-date with zero hearsay.
"""

import sys
import os
import glob
import json
import hashlib
import argparse
from pathlib import Path
from datetime import datetime
import urllib.request
import urllib.error
import re
from html.parser import HTMLParser
import yaml

ROOT_DIR = Path(__file__).resolve().parent.parent
SPECS_DIR = ROOT_DIR / "backend" / "specs"
DATA_DIR = ROOT_DIR / "backend" / "data"
SNAPSHOT_FILE = DATA_DIR / "spec_snapshots.json"
CHANGES_FILE = DATA_DIR / "detected_changes.json"

# Identify honestly; no browser impersonation.
USER_AGENT = "ACV-spec-monitor/1.0 (+https://github.com/Greycity1988/ad-creative-validator)"

MIN_TEXT_CHARS = 200  # below this the page is a JavaScript shell; its hash says nothing

_SKIP_TAGS = {"script", "style", "noscript", "svg", "template", "head"}


class _TextExtractor(HTMLParser):
    """Collects the visible text of a page, so markup, scripts and tokens do not count as changes."""

    def __init__(self):
        super().__init__()
        self.parts = []
        self._skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in _SKIP_TAGS:
            self._skip += 1

    def handle_endtag(self, tag):
        if tag in _SKIP_TAGS and self._skip:
            self._skip -= 1

    def handle_data(self, data):
        if not self._skip:
            self.parts.append(data)


def visible_text(body: bytes, charset: str) -> str:
    parser = _TextExtractor()
    parser.feed(body.decode(charset or "utf-8", errors="replace"))
    # Digits change with dates, counters and view counts; spec numbers live in the YAML anyway
    text = re.sub(r"\d+", "#", " ".join(parser.parts))
    return re.sub(r"\s+", " ", text).strip()


def fetch_url_content(url: str, timeout: int = 15) -> dict:
    """Fetch URL (TLS verified) and hash its visible text."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            body = response.read()
            text = visible_text(body, response.headers.get_content_charset())
            return {
                "status": response.status,
                "success": True,
                "content_hash": hashlib.sha256(text.encode("utf-8")).hexdigest(),
                "content_length": len(text),
                "etag": response.headers.get("etag", ""),
                "last_modified": response.headers.get("last-modified", ""),
                "error": None,
            }
    except urllib.error.HTTPError as err:
        return {"status": err.code, "success": False, "content_hash": None, "content_length": 0,
                "etag": "", "last_modified": "", "error": f"HTTP {err.code}: {err.reason}"}
    except Exception as err:
        return {"status": 0, "success": False, "content_hash": None, "content_length": 0,
                "etag": "", "last_modified": "", "error": type(err).__name__}


def load_snapshots() -> dict:
    if SNAPSHOT_FILE.exists():
        try:
            with open(SNAPSHOT_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def save_snapshots(snapshots: dict):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(SNAPSHOT_FILE, "w", encoding="utf-8") as f:
        json.dump(snapshots, f, ensure_ascii=False, indent=2)


def run_monitor(update_baseline: bool = False) -> int:
    snapshots = load_snapshots()
    changes = []
    results = []

    yaml_files = sorted(SPECS_DIR.glob("*.yaml"))
    print(f"🔍 Monitoring {len(yaml_files)} advertising platform specifications...")

    for yf in yaml_files:
        pid = yf.stem
        try:
            with open(yf, "r", encoding="utf-8") as f:
                spec = yaml.safe_load(f) or {}
        except Exception as err:
            print(f"❌ Error reading {yf.name}: {err}")
            continue

        pname = spec.get("platform", pid)
        url = spec.get("official_source_url", "").strip()

        if not url:
            results.append({
                "id": pid,
                "name": pname,
                "status": "SKIPPED",
                "message": "No official_source_url defined",
            })
            continue

        res = fetch_url_content(url)
        prev = snapshots.get(pid)

        if not res["success"]:
            results.append({
                "id": pid,
                "name": pname,
                "status": "ERROR",
                "message": res["error"],
                "url": url,
            })
            continue

        if res["content_length"] < MIN_TEXT_CHARS:
            results.append({
                "id": pid,
                "name": pname,
                "status": "UNREADABLE",
                "message": f"visible text {res['content_length']} chars (page needs JavaScript)",
                "url": url,
            })
            continue

        is_new = prev is None
        has_changed = False

        if not is_new and not update_baseline:
            # Compare hash
            if prev.get("content_hash") != res["content_hash"]:
                has_changed = True
                changes.append({
                    "id": pid,
                    "name": pname,
                    "url": url,
                    "prev_hash": prev.get("content_hash"),
                    "new_hash": res["content_hash"],
                    "prev_verified": prev.get("last_checked"),
                    "detected_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                })

        # Update snapshot in memory
        snapshots[pid] = {
            "id": pid,
            "name": pname,
            "url": url,
            "content_hash": res["content_hash"],
            "content_length": res["content_length"],
            "etag": res["etag"],
            "last_modified": res["last_modified"],
            "last_checked": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

        status_str = "CHANGED 🚨" if has_changed else ("NEW 🆕" if is_new else "OK ✅")
        results.append({
            "id": pid,
            "name": pname,
            "status": status_str,
            "url": url,
        })

    # Save snapshots if baseline requested or if new entries were added
    if update_baseline or not SNAPSHOT_FILE.exists():
        save_snapshots(snapshots)
        print(f"\n💾 Baseline snapshots saved to {SNAPSHOT_FILE}")

    # Save changes report
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(CHANGES_FILE, "w", encoding="utf-8") as f:
        json.dump(
            {
                "checked_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "total_monitored": len(results),
                "changes_count": len(changes),
                "changes": changes,
                # Pages that could not be checked: dead links, blocked requests, JavaScript-only pages
                "unchecked": [r for r in results if r["status"] in ("ERROR", "UNREADABLE")],
            },
            f,
            ensure_ascii=False,
            indent=2,
        )

    # Print summary
    print("\n" + "=" * 60)
    print("📊 SPECIFICATION MONITORING SUMMARY")
    print("=" * 60)
    for r in results:
        msg = f" - [{r['status']:<10}] {r['name']:<30} ({r.get('url', r.get('message', ''))[:45]})"
        print(msg)

    print("-" * 60)
    print(f"Total Monitored: {len(results)} | Changes Detected: {len(changes)}")
    if changes:
        print("\n🚨 Platforms with Detected Official Guide Updates:")
        for c in changes:
            print(f"  • {c['name']} ({c['url']})")
    print("=" * 60 + "\n")

    return 0


def main():
    parser = argparse.ArgumentParser(description="ACV Official Specification Change Detector")
    parser.add_argument(
        "--update-baseline",
        action="store_true",
        help="Update snapshot cache with current live publisher web state",
    )
    args = parser.parse_args()
    sys.exit(run_monitor(update_baseline=args.update_baseline))


if __name__ == "__main__":
    main()
