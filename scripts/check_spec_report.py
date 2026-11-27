#!/usr/bin/env python3
"""Check a spec report issue against the official guide it cites.

Run by .github/workflows/spec-report.yml for issues labelled `spec-report`. The issue text is
untrusted: this script only reads it as data, re-validates every field, fetches the guide itself
(official hosts only, see frontend/src/data/officialSources.json) and looks for the reported values
in the guide's own text. It never merges anything.

Outputs (in --out):
  result.json  {"status": ..., "branch_ready": bool, ...}
  comment.md   comment for the issue
  pr_body.md   pull request body (only when branch_ready)
When the report checks out, it appends the placement to backend/specs/<platform>.yaml.

Statuses: verified | stale (found, but the guide is older than 12 months or undated PDF)
          | attachment (found in a file the reporter attached; added as "needs confirmation")
          | duplicate | not_found | fetch_failed | needs_review | invalid

Attached guide files live in the project's private Vercel Blob store. They are read with
BLOB_READ_WRITE_TOKEN, sent only to *.private.blob.vercel-storage.com, never through redirects.
"""
from __future__ import annotations

import argparse
import datetime as dt
import html
import io
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
SOURCES = json.loads((ROOT / "frontend/src/data/officialSources.json").read_text(encoding="utf-8"))["platforms"]
SPECS = ROOT / "backend/specs"
MARKER = "acv-spec-report"
FORMATS = {"jpg", "png", "gif", "webp"}
MAX_BYTES = 20 * 1024 * 1024
ATTACHMENT_MAX = 4 * 1024 * 1024
ATTACHMENT_TYPES = {"application/pdf", "image/png", "image/jpeg"}
BLOB_HOST = re.compile(r"^[a-z0-9]+\.private\.blob\.vercel-storage\.com$")
FRESH_DAYS = 365
UA = "Mozilla/5.0 (compatible; ACV-spec-check/1.0; +https://github.com/Greycity1988/ad-creative-validator)"


# ── report parsing and validation (mirrors frontend/src/utils/specReport.ts) ──

def is_official_url(platform_id: str, url: str) -> bool:
    try:
        u = urllib.parse.urlsplit(url)
    except ValueError:
        return False
    if u.scheme != "https" or u.username or u.password or u.port:
        return False
    host = (u.hostname or "").lower()
    for s in SOURCES.get(platform_id, {}).get("sources", []):
        if s["host"] == host and u.path.startswith(s.get("pathPrefix", "")):
            return True
    return False


def parse_report(body: str) -> dict:
    m = re.search(r"<!--\s*" + MARKER + r"\s*(\{.*?\})\s*-->", body or "", re.S)
    if not m:
        raise ValueError("제보 양식의 데이터 블록을 찾지 못했습니다. 사이트의 제보 양식으로 다시 제보해 주세요.")
    try:
        r = json.loads(m.group(1))
    except json.JSONDecodeError as e:
        raise ValueError(f"제보 데이터를 읽지 못했습니다 ({e.msg}).")
    if not isinstance(r, dict):
        raise ValueError("제보 데이터 형식이 올바르지 않습니다.")

    pid = r.get("platformId")
    if pid not in SOURCES:
        raise ValueError("알 수 없는 매체입니다.")
    w, h = r.get("width"), r.get("height")
    if not all(isinstance(v, int) and 10 <= v <= 8000 for v in (w, h)):
        raise ValueError("가로·세로 값이 올바르지 않습니다.")
    kb = r.get("maxKb")
    if kb is not None and not (isinstance(kb, int) and 1 <= kb <= 512000):
        raise ValueError("최대 용량 값이 올바르지 않습니다.")
    fmts = r.get("formats")
    if not isinstance(fmts, list) or not fmts or not set(fmts) <= FORMATS:
        raise ValueError("파일 형식 값이 올바르지 않습니다.")
    att = parse_attachment(r.get("attachment"))
    url = r.get("guideUrl") or ""
    if not isinstance(url, str) or (url and not is_official_url(pid, url)):
        raise ValueError("공식 가이드 주소가 아닙니다.")
    if not url and not att:
        raise ValueError("공식 가이드 주소도 첨부 파일도 없습니다.")
    name = r.get("placementName")
    if not isinstance(name, str) or not (2 <= len(name.strip()) <= 60) or re.search(r"[<>`\x00-\x1f]", name):
        raise ValueError("지면 이름이 올바르지 않습니다.")
    doc_date = r.get("docDate")
    if doc_date is not None and not (isinstance(doc_date, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", doc_date)):
        raise ValueError("문서 날짜 형식이 올바르지 않습니다.")
    return {
        "platformId": pid,
        "placementName": name.strip(),
        "width": w,
        "height": h,
        "maxKb": kb,
        "formats": sorted(set(fmts)),
        "transparent": r.get("transparent") is True,
        "guideUrl": url,
        "docDate": doc_date,
        "attachment": att,
    }


def parse_attachment(a) -> dict | None:
    """Validate the attachment record; its URL must point at a private Vercel Blob store."""
    if a is None:
        return None
    if not isinstance(a, dict):
        raise ValueError("첨부 정보가 올바르지 않습니다.")
    url, path, ctype, size = a.get("url"), a.get("pathname"), a.get("contentType"), a.get("size")
    u = urllib.parse.urlsplit(url if isinstance(url, str) else "")
    if (
        u.scheme != "https" or not BLOB_HOST.match(u.hostname or "") or u.username or u.password or u.port
        or not isinstance(path, str) or not path.startswith("spec-reports/") or u.path != "/" + path
        or ctype not in ATTACHMENT_TYPES or not isinstance(size, int) or not (0 < size <= ATTACHMENT_MAX)
    ):
        raise ValueError("첨부 정보가 올바르지 않습니다.")
    name = a.get("name") if isinstance(a.get("name"), str) else "guide"
    return {"url": url, "pathname": path, "contentType": ctype, "size": size,
            "name": re.sub(r"[<>`|\x00-\x1f]", " ", name)[:80]}


class _NoRedirects(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise urllib.error.HTTPError(newurl, code, "첨부 파일 주소가 다른 곳으로 이동합니다", headers, fp)


def fetch_attachment(att: dict) -> bytes:
    token = os.environ.get("BLOB_READ_WRITE_TOKEN")
    if not token:
        raise RuntimeError("BLOB_READ_WRITE_TOKEN이 없어 첨부 파일을 열 수 없습니다")
    opener = urllib.request.build_opener(_NoRedirects())
    req = urllib.request.Request(att["url"], headers={"Authorization": f"Bearer {token}", "User-Agent": UA})
    with opener.open(req, timeout=30) as res:
        data = res.read(ATTACHMENT_MAX + 1)
    if len(data) > ATTACHMENT_MAX:
        raise ValueError("첨부 파일이 4MB보다 큽니다")
    return data


def sniff(data: bytes) -> str | None:
    if data[:4] == b"%PDF":
        return "application/pdf"
    if data[:4] == b"\x89PNG":
        return "image/png"
    if data[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    return None


# ── fetching the guide ──

class _OfficialRedirects(urllib.request.HTTPRedirectHandler):
    def __init__(self, platform_id: str):
        self.platform_id = platform_id

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not is_official_url(self.platform_id, newurl):
            raise urllib.error.HTTPError(newurl, code, "공식 주소 밖으로 이동하는 링크", headers, fp)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def fetch(platform_id: str, url: str) -> tuple[bytes, dict]:
    opener = urllib.request.build_opener(_OfficialRedirects(platform_id))
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/pdf,*/*"})
    with opener.open(req, timeout=30) as res:
        data = res.read(MAX_BYTES + 1)
        if len(data) > MAX_BYTES:
            raise ValueError("문서가 20MB보다 큽니다.")
        return data, {
            "content_type": res.headers.get("Content-Type", ""),
            "last_modified": res.headers.get("Last-Modified"),
            "final_url": res.geturl(),
        }


def to_text(data: bytes, content_type: str) -> tuple[str, str]:
    """Return (text, kind) where kind is 'pdf' or 'page'."""
    if data[:5] == b"%PDF-" or "pdf" in content_type:
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(data))
        return "\n".join((p.extract_text() or "") for p in reader.pages), "pdf"
    raw = data.decode("utf-8", errors="replace")
    raw = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", raw)
    raw = re.sub(r"(?s)<[^>]+>", " ", raw)
    return html.unescape(raw), "page"


def normalize(text: str) -> str:
    t = text.replace("×", "x").replace("✕", "x").replace("ｘ", "x").replace("*", "x").replace("X", "x")
    t = re.sub(r"(?<=\d),(?=\d{3}\b)", "", t)  # 1,200 -> 1200
    return re.sub(r"[ \t ]+", " ", t)


# ── finding the reported values in the guide ──

def snippet(text: str, start: int, end: int, pad: int = 50) -> str:
    s = text[max(0, start - pad): end + pad]
    return re.sub(r"\s+", " ", s).strip()


def find_evidence(text: str, r: dict) -> dict:
    t = normalize(text)
    w, h = r["width"], r["height"]
    ev: dict = {}

    m = re.search(rf"(?<!\d){w}\s*(?:px)?\s*x\s*{h}(?!\d)", t, re.I)
    if m:
        ev["size"] = {"kind": "WxH", "quote": snippet(t, m.start(), m.end())}
    else:
        # both numbers close together, e.g. "가로 750px / 세로 160px"
        for mw in re.finditer(rf"(?<!\d){w}(?!\d)", t):
            window = t[mw.start(): mw.start() + 80]
            mh = re.search(rf"(?<!\d){h}(?!\d)", window[len(str(w)):])
            if mh:
                ev["size"] = {"kind": "near", "quote": snippet(t, mw.start(), mw.start() + len(str(w)) + mh.end())}
                break

    kb = r.get("maxKb")
    if kb:
        pats = [rf"(?<!\d){kb}\s*(?:kb|kbyte|킬로바이트)"]
        if kb % 1024 == 0:
            pats.append(rf"(?<!\d){kb // 1024}\s*(?:mb|메가)")
        if kb % 1000 == 0:
            pats.append(rf"(?<!\d){kb // 1000}\s*(?:mb|메가)")
        for p in pats:
            m = re.search(p, t, re.I)
            if m:
                ev["maxKb"] = {"quote": snippet(t, m.start(), m.end())}
                break

    if r.get("transparent"):
        m = re.search(r"투명|transparen|누끼", t, re.I)
        if m:
            ev["transparent"] = {"quote": snippet(t, m.start(), m.end())}

    ev["formats"] = [f for f in r["formats"] if re.search(rf"\b{f}\b" + ("|jpeg" if f == "jpg" else ""), t, re.I)]
    return ev


DATE_PATTERNS = [
    r"(20\d{2})[.\-/]\s?(\d{1,2})[.\-/]\s?(\d{1,2})",
    r"(20\d{2})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일",
]


def find_doc_date(text: str, meta: dict, today: dt.date) -> tuple[dt.date | None, str]:
    """Latest plausible date printed in the guide, else the server's Last-Modified."""
    found = []
    for p in DATE_PATTERNS:
        for y, mo, d in re.findall(p, text):
            try:
                day = dt.date(int(y), int(mo), int(d))
            except ValueError:
                continue
            if dt.date(2015, 1, 1) <= day <= today:
                found.append(day)
    if found:
        return max(found), "문서에 적힌 날짜"
    if meta.get("last_modified"):
        try:
            from email.utils import parsedate_to_datetime

            return parsedate_to_datetime(meta["last_modified"]).date(), "서버의 수정 시각"
        except (TypeError, ValueError):
            pass
    return None, "날짜 없음"


# ── writing the placement ──

def existing_same_size(pid: str, w: int, h: int) -> str | None:
    data = yaml.safe_load((SPECS / f"{pid}.yaml").read_text(encoding="utf-8"))
    for p in data.get("placements", []):
        if p.get("exact_width") == w and p.get("exact_height") == h:
            return p.get("name")
    return None


def append_placement(pid: str, placement: dict) -> None:
    path = SPECS / f"{pid}.yaml"
    text = path.read_text(encoding="utf-8")
    data = yaml.safe_load(text)
    if list(data.keys())[-1] != "placements":
        raise RuntimeError(f"{path.name}: placements is not the last key; refusing to append")
    block = yaml.safe_dump([placement], allow_unicode=True, sort_keys=False, width=1000)
    path.write_text(text.rstrip("\n") + "\n" + block, encoding="utf-8")
    yaml.safe_load(path.read_text(encoding="utf-8"))  # still valid YAML


def build_placement(r: dict, issue: int, ev: dict, kind: str, doc_date: dt.date | None, fresh: bool, today: dt.date) -> dict:
    """kind: 'page' / 'pdf' (official URL) or 'attachment' (file the reporter uploaded)."""
    pname = SOURCES[r["platformId"]]["name"]
    w, h = r["width"], r["height"]
    suffix = " 투명 PNG" if r["transparent"] and r["formats"] == ["png"] else ""
    formats: list[str] = []
    for f in r["formats"]:
        formats += ["jpg", "jpeg"] if f == "jpg" else [f]
    p: dict = {
        "name": f"{pname} {r['placementName']} ({w}×{h}{suffix})",
        "exact_width": w,
        "exact_height": h,
    }
    where = {"pdf": "공식 문서", "page": "공식 페이지", "attachment": "제보자가 첨부한 문서(비공개 보관)"}[kind]
    notes = [f"사용자 제보 #{issue} 자동 확인: {where}에서 \"{ev['size']['quote'][:120]}\" 확인."]
    if r.get("maxKb"):
        if "maxKb" in ev:
            p["max_file_size_kb"] = r["maxKb"]
        else:
            notes.append(f"제보된 최대 용량 {r['maxKb']}KB는 문서에서 찾지 못해 넣지 않음.")
    p["allowed_formats"] = formats
    if r["transparent"]:
        if "transparent" in ev:
            p["require_transparency"] = True
        else:
            notes.append("제보된 투명 배경 조건은 문서에서 찾지 못해 넣지 않음.")
    if kind == "attachment":
        # An uploaded file cannot prove it came from the publisher: never marked verified.
        notes.append(f"첨부 파일 `{r['attachment']['pathname']}`이 매체 공식 자료인지 운영자 확인 필요 [매체 확인 중].")
        p["description"] = " ".join(notes)
        p["needs_confirmation"] = True
        return p
    p["description"] = " ".join(notes)
    p["verified"] = True
    p["source_type"] = "official_document" if kind == "pdf" else "official_page"
    p["source_date"] = (doc_date or today).isoformat() if kind == "pdf" else today.isoformat()
    p["source"] = r["guideUrl"]
    if not fresh:
        p["needs_confirmation"] = True
    return p


# ── main ──

def run(body: str, issue: int, out: Path, today: dt.date, fetcher=fetch, attachment_fetcher=fetch_attachment) -> dict:
    out.mkdir(parents=True, exist_ok=True)
    footer = "\n\n---\n자동 점검 결과입니다. 사이트 반영은 운영자가 PR을 검토하고 머지한 뒤에 이루어집니다."

    def finish(status: str, comment: str, extra: dict | None = None) -> dict:
        result = {"status": status, "branch_ready": status in ("verified", "stale", "attachment"), **(extra or {})}
        (out / "result.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        (out / "comment.md").write_text(comment + footer, encoding="utf-8")
        return result

    try:
        r = parse_report(body)
    except ValueError as e:
        return finish("invalid", f"### ❌ 제보 형식 오류\n{e}")

    pname = SOURCES[r["platformId"]]["name"]
    size = f"{r['width']}×{r['height']}"
    dup = existing_same_size(r["platformId"], r["width"], r["height"])
    if dup:
        return finish("duplicate", f"### ℹ️ 이미 등록된 규격\n{pname} {size}은 이미 `{dup}` 지면으로 등록돼 있습니다. 값이 다르다면 이 이슈에 근거와 함께 알려주세요.")

    att = r.get("attachment")
    att_line = f"\n\n첨부 파일: {att['name']} (비공개 보관, Vercel → Storage에서 `{att['pathname']}`)" if att else ""
    source_label = r["guideUrl"] or f"첨부 파일 {att['name']}"
    kind = None
    text, meta, ev = "", {}, {}
    problems = []

    if r["guideUrl"]:
        try:
            data, meta = fetcher(r["platformId"], r["guideUrl"])
            text, kind = to_text(data, meta.get("content_type", ""))
            ev = find_evidence(text, r)
            if "size" not in ev:
                problems.append(f"공식 가이드 `{r['guideUrl']}` 본문에서 가로 {r['width']}와 세로 {r['height']}를 함께 찾지 못했습니다.")
        except Exception as e:  # network, HTTP status, PDF parsing
            problems.append(f"공식 가이드 `{r['guideUrl']}`를 열지 못했습니다 ({type(e).__name__}: {str(e)[:160]}).")

    if "size" not in ev and att:
        try:
            data = attachment_fetcher(att)
            real = sniff(data)
            if real != att["contentType"]:
                raise ValueError(f"첨부 파일 형식이 신고된 것({att['contentType']})과 다릅니다 ({real})")
            if real != "application/pdf":
                return finish(
                    "needs_review",
                    "### 🖼️ 이미지 첨부는 자동으로 읽지 않습니다\n" + "".join(f"- {x}\n" for x in problems)
                    + f"\n운영자가 첨부 이미지를 열어 {size} 규격을 확인하겠습니다." + att_line,
                    {"label": "needs-human"},
                )
            text, _ = to_text(data, "application/pdf")
            ev = find_evidence(text, r)
            meta = {}
            kind = "attachment"
            if "size" not in ev:
                problems.append(f"첨부 문서 본문에서 가로 {r['width']}와 세로 {r['height']}를 함께 찾지 못했습니다.")
        except Exception as e:
            problems.append(f"첨부 파일을 열지 못했습니다 ({type(e).__name__}: {str(e)[:160]}).")

    if "size" not in ev:
        failed_to_open = all("열지 못했습니다" in x for x in problems)
        title = "### ⚠️ 문서를 열지 못했습니다" if failed_to_open else f"### ⚠️ 문서에서 {size}를 찾지 못했습니다"
        return finish(
            "fetch_failed" if failed_to_open else "not_found",
            title + "\n" + "".join(f"- {x}\n" for x in problems)
            + "\n매체 사이트가 자동 접속을 막거나, 이미지로만 적힌 문서일 수 있습니다. 운영자가 직접 확인하겠습니다." + att_line,
            {"label": "needs-human"},
        )

    doc_date, basis = find_doc_date(text, meta, today)
    if kind == "attachment":
        fresh = False
        date_line = (f"{doc_date.isoformat()} ({basis}) · " if doc_date else "") + "첨부 문서라 '매체 확인 중'으로 등록"
    elif kind == "page":
        fresh, date_line = True, f"현행 공식 페이지 (조회일 {today.isoformat()})"
    elif doc_date:
        fresh = (today - doc_date).days <= FRESH_DAYS
        date_line = f"{doc_date.isoformat()} ({basis})" + ("" if fresh else " · 12개월 이상 지남 → '매체 확인 중'으로 등록")
    else:
        fresh, date_line = False, "문서 날짜를 찾지 못함 → '매체 확인 중'으로 등록"

    placement = build_placement(r, issue, ev, kind, doc_date, fresh, today)
    append_placement(r["platformId"], placement)

    rows = [
        f"| 크기 {size} | ✅ \"{ev['size']['quote'][:140]}\" |",
        f"| 최대 용량 | {'✅ \"' + ev['maxKb']['quote'][:100] + '\"' if 'maxKb' in ev else ('❔ 문서에서 못 찾음 (제외)' if r.get('maxKb') else '- 제보 없음')} |",
        f"| 투명 배경 | {'✅ \"' + ev['transparent']['quote'][:100] + '\"' if 'transparent' in ev else ('❔ 문서에서 못 찾음 (제외)' if r['transparent'] else '- 해당 없음')} |",
        f"| 형식 | 문서에 있음: {', '.join(ev['formats']).upper() or '없음'} / 제보: {', '.join(r['formats']).upper()} |",
        f"| 기준일 | {date_line} |",
    ]
    status = "attachment" if kind == "attachment" else ("verified" if fresh else "stale")
    head = {
        "verified": "### ✅ 공식 가이드에서 확인했습니다",
        "stale": "### 🟡 확인했지만 오래된 문서입니다",
        "attachment": "### 🟡 첨부 문서에서 확인했습니다 (출처 확인 필요)",
    }[status]
    comment = (
        f"{head}\n{pname} {r['placementName']} {size}\n\n| 항목 | 근거 |\n|---|---|\n" + "\n".join(rows)
        + "\n\n지면을 추가한 PR을 열었습니다. 운영자가 검토 후 반영합니다." + att_line
    )
    pr_body = (
        f"사용자 제보 #{issue}를 자동 점검해 `backend/specs/{r['platformId']}.yaml`에 지면을 추가했습니다.\n\n"
        f"- 근거 문서: {source_label}\n- 추가한 지면: `{placement['name']}`\n\n| 항목 | 근거 |\n|---|---|\n" + "\n".join(rows)
        + (f"\n\n**첨부 문서 근거입니다.** Vercel → Storage에서 `{att['pathname']}`를 열어 매체 공식 자료인지 확인해 주세요. "
           "확인되면 `needs_confirmation`을 지우고 `verified: true`, `source_type: media_confirmed`, `source_date`, `source`(문서 설명)를 넣어 머지합니다."
           if kind == "attachment" else "")
        + "\n\n**머지 전 확인할 것**\n- [ ] 근거 문구가 실제로 이 지면의 규격인지 (다른 지면 표의 숫자가 아닌지)\n"
        "- [ ] 지면 이름과 용량·형식\n\n"
        f"Closes #{issue}\n\n🤖 자동 점검 워크플로(`spec-report.yml`)가 만든 PR입니다."
    )
    (out / "pr_body.md").write_text(pr_body, encoding="utf-8")
    return finish(status, comment, {"platform": r["platformId"], "placement": placement["name"]})


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--issue", type=int, required=True)
    ap.add_argument("--body-file", required=True, help="file holding the issue body (written by the workflow)")
    ap.add_argument("--out", default="spec-report-out")
    a = ap.parse_args()
    body = Path(a.body_file).read_text(encoding="utf-8")
    result = run(body, a.issue, Path(a.out), dt.date.today())
    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
