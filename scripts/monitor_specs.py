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
import ssl
import yaml

ROOT_DIR = Path(__file__).resolve().parent.parent
SPECS_DIR = ROOT_DIR / "backend" / "specs"
DATA_DIR = ROOT_DIR / "backend" / "data"
SNAPSHOT_FILE = DATA_DIR / "spec_snapshots.json"
CHANGES_FILE = DATA_DIR / "detected_changes.json"

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

# Create SSL context that allows standard public certificates
SSL_CONTEXT = ssl.create_default_context()
SSL_CONTEXT.check_hostname = False
SSL_CONTEXT.verify_mode = ssl.CERT_NONE


def fetch_url_content(url: str, timeout: int = 10) -> dict:
    """Fetch URL and return status, hash, etag, and last-modified."""
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
            "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"macOS"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout, context=SSL_CONTEXT) as response:
            status = response.status
            headers = dict(response.headers)
            body = response.read()

            # Hash the raw body bytes
            content_hash = hashlib.sha256(body).hexdigest()

            return {
                "status": status,
                "success": True,
                "content_hash": content_hash,
                "content_length": len(body),
                "etag": headers.get("etag", ""),
                "last_modified": headers.get("last-modified", ""),
                "error": None,
            }
    except urllib.error.HTTPError as err:
        return {
            "status": err.code,
            "success": False,
            "content_hash": None,
            "content_length": 0,
            "etag": "",
            "last_modified": "",
            "error": f"HTTP {err.code}: {err.reason}",
        }
    except Exception as err:
        return {
            "status": 0,
            "success": False,
            "content_hash": None,
            "content_length": 0,
            "etag": "",
            "last_modified": "",
            "error": str(err),
        }


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
