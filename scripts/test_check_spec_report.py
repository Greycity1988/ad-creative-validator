"""Tests for check_spec_report.py. Run: python3 -m unittest scripts/test_check_spec_report.py"""
import datetime as dt
import io
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import check_spec_report as c  # noqa: E402

TODAY = dt.date(2026, 11, 26)


def body(**kw):
    r = dict(platformId="appier", placementName="모바일 배너", width=320, height=250, maxKb=150,
             formats=["jpg", "png"], transparent=False, guideUrl="https://www.appier.com/creative-specs")
    r.update(kw)
    return f"표\n<!-- acv-spec-report\n{json.dumps(r, ensure_ascii=False)}\n-->"


def page(html):
    return lambda pid, url: (html.encode(), {"content_type": "text/html"})


def pdf(text):
    """Minimal one-page PDF holding one line of text."""
    stream = f"BT /F1 12 Tf 20 100 Td ({text}) Tj ET".encode()
    objs = [b"<< /Type /Catalog /Pages 2 0 R >>", b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
            b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 200] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
            b"<< /Length %d >>\nstream\n" % len(stream) + stream + b"\nendstream",
            b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"]
    out = io.BytesIO()
    out.write(b"%PDF-1.4\n")
    offs = []
    for i, o in enumerate(objs, 1):
        offs.append(out.tell())
        out.write(b"%d 0 obj\n" % i + o + b"\nendobj\n")
    x = out.tell()
    out.write(b"xref\n0 %d\n0000000000 65535 f \n" % (len(objs) + 1))
    for o in offs:
        out.write(b"%010d 00000 n \n" % o)
    out.write(b"trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF" % (len(objs) + 1, x))
    data = out.getvalue()
    return lambda pid, url: (data, {"content_type": "application/pdf"})


class CheckSpecReportTest(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        shutil.copytree(c.SPECS, self.tmp / "specs")
        self._specs, c.SPECS = c.SPECS, self.tmp / "specs"
        self.out = self.tmp / "out"

    def tearDown(self):
        c.SPECS = self._specs
        shutil.rmtree(self.tmp)

    def run_case(self, b, fetcher):
        res = c.run(b, 101, self.out, TODAY, fetcher=fetcher)
        return res, (self.out / "comment.md").read_text(encoding="utf-8")

    def added(self):
        import yaml
        data = yaml.safe_load((c.SPECS / "appier.yaml").read_text(encoding="utf-8"))
        return data["placements"][-1]

    def test_found_on_official_page(self):
        res, comment = self.run_case(body(), page(
            "<table><tr><td>Mobile banner</td><td>320 × 250 px</td><td>JPG, PNG</td><td>max 150KB</td></tr></table>"))
        self.assertEqual(res["status"], "verified")
        self.assertTrue(res["branch_ready"])
        p = self.added()
        self.assertEqual((p["exact_width"], p["exact_height"], p["max_file_size_kb"]), (320, 250, 150))
        self.assertEqual(p["source_type"], "official_page")
        self.assertNotIn("needs_confirmation", p)
        self.assertIn("320 x 250", comment)
        self.assertIn("Closes #101", (self.out / "pr_body.md").read_text(encoding="utf-8"))

    def test_old_pdf_is_added_as_needing_confirmation(self):
        res, _ = self.run_case(body(), pdf("Banner 320x250 PNG JPG 150KB - 2023.01.05"))
        self.assertEqual(res["status"], "stale")
        p = self.added()
        self.assertTrue(p["needs_confirmation"])
        self.assertEqual(p["source_date"], "2023-01-05")

    def test_values_not_in_the_guide_are_left_out(self):
        res, comment = self.run_case(body(maxKb=999, transparent=True), page("<p>Banner 320x250 JPG</p>"))
        self.assertEqual(res["status"], "verified")
        p = self.added()
        self.assertNotIn("max_file_size_kb", p)
        self.assertNotIn("require_transparency", p)
        self.assertIn("문서에서 못 찾음", comment)

    def test_size_missing_from_guide(self):
        res, _ = self.run_case(body(), page("<p>Supported: 300x250, 320x50</p>"))
        self.assertEqual(res["status"], "not_found")
        self.assertFalse(res["branch_ready"])
        self.assertEqual(res["label"], "needs-human")

    def test_already_registered(self):
        res, _ = self.run_case(body(width=300, height=250), page("x"))
        self.assertEqual(res["status"], "duplicate")

    def test_tampered_or_missing_data_block(self):
        self.assertEqual(self.run_case("no block", page("x"))[0]["status"], "invalid")
        self.assertEqual(self.run_case(body(guideUrl="https://blog.naver.com/x"), page("x"))[0]["status"], "invalid")
        self.assertEqual(self.run_case(body(width="320"), page("x"))[0]["status"], "invalid")

    def test_unreachable_guide(self):
        def boom(pid, url):
            raise OSError("403 Forbidden")
        res, comment = self.run_case(body(), boom)
        self.assertEqual(res["status"], "fetch_failed")
        self.assertIn("403", comment)

    def test_redirects_stay_on_official_hosts(self):
        with self.assertRaises(Exception):
            c._OfficialRedirects("appier").redirect_request(None, None, 302, "Found", {}, "https://evil.example/x")


if __name__ == "__main__":
    unittest.main()
