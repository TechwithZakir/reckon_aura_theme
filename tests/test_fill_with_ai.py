"""Fill with AI: the plan gate, the daily limit and reading a photo or PDF. Runs without a Frappe site."""

import base64
import importlib.util
import sys
import unittest
from pathlib import Path
from types import ModuleType, SimpleNamespace
from unittest.mock import Mock, patch

API = Path(__file__).resolve().parents[1] / "reckon_aura_theme" / "api.py"
JS = Path(__file__).resolve().parents[1] / "reckon_aura_theme" / "public" / "js" / "aura_desk.js"


class Boom(Exception):
    pass


def load_api():
    frappe = ModuleType("frappe")
    frappe._ = lambda text: text
    frappe.whitelist = lambda *a, **k: (lambda fn: fn)
    frappe.throw = Mock(side_effect=lambda message, exc=Boom, **k: (_ for _ in ()).throw(exc(message)))
    frappe.PermissionError = type("PermissionError", (Exception,), {})
    frappe.TooManyRequestsError = type("TooManyRequestsError", (Exception,), {})
    frappe.session = SimpleNamespace(user="u@x.test")
    frappe.get_installed_apps = lambda: []
    frappe.log_error = Mock()
    frappe.get_traceback = lambda: ""
    cache = SimpleNamespace(incrby=Mock(), expire=Mock(), get=Mock(return_value=None))  # not callable, like frappe.cache in v16
    frappe.cache = cache
    limiter = ModuleType("frappe.rate_limiter")
    limiter.rate_limit = lambda **k: (lambda fn: fn)
    utils = ModuleType("frappe.utils")
    for name in ("add_days", "add_months", "get_first_day", "fmt_money"):
        setattr(utils, name, Mock())
    utils.cint = lambda v: int(float(v or 0))
    utils.flt = lambda v, *a: float(v or 0)
    utils.getdate = lambda v=None: v
    utils.nowdate = lambda: "2026-11-17"
    requests = ModuleType("requests")
    requests.HTTPError = type("HTTPError", (Exception,), {})
    requests.RequestException = type("RequestException", (Exception,), {})
    stubs = {"frappe": frappe, "frappe.rate_limiter": limiter, "frappe.utils": utils, "requests": requests}
    with patch.dict(sys.modules, stubs):
        spec = importlib.util.spec_from_file_location("aura_api_under_test", API)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
    return module, frappe, cache


PNG = b"\x89PNG\r\n\x1a\n" + b"0" * 20
PDF = b"%PDF-1.4 " + b"0" * 20


class AttachmentTests(unittest.TestCase):
    def test_a_photo_and_a_pdf_are_recognised_by_their_bytes(self):
        api, _f, _c = load_api()
        self.assertEqual(api._read_attachment(base64.b64encode(PNG).decode())["media_type"], "image/png")
        self.assertEqual(api._read_attachment("data:application/pdf;base64," + base64.b64encode(PDF).decode())["media_type"], "application/pdf")

    def test_other_files_and_big_files_are_refused(self):
        api, _f, _c = load_api()
        with self.assertRaises(Boom):
            api._read_attachment(base64.b64encode(b"MZ executable").decode())
        with self.assertRaises(Boom):
            api._read_attachment("not base64 !!")
        with self.assertRaises(Boom):
            api._read_attachment(base64.b64encode(PNG + b"0" * api.MAX_FILL_FILE_BYTES).decode())

    def test_the_provider_gets_the_image_in_its_own_format(self):
        api, _f, _c = load_api()
        att = [{"media_type": "image/png", "data": "QUJD"}]
        self.assertEqual(api._anthropic_content("read", att)[0]["type"], "image")
        self.assertEqual(api._anthropic_content("read", [{"media_type": "application/pdf", "data": "QUJD"}])[0]["type"], "document")
        self.assertTrue(api._openai_content("read", att)[1]["image_url"]["url"].startswith("data:image/png;base64,"))
        self.assertEqual(api._openai_content("read", None), "read")


class PolicyTests(unittest.TestCase):
    def test_the_daily_limit_stops_the_extra_use_and_gives_it_back(self):
        api, frappe, cache = load_api()
        cache.incrby = Mock(return_value=6)
        with self.assertRaises(frappe.TooManyRequestsError):
            api._take_fill_use(5)
        self.assertEqual(cache.incrby.call_args_list[-1][0][1], -1)
        cache.incrby = Mock(return_value=3)
        api._take_fill_use(5)  # inside the limit: no error
        api._take_fill_use(None)  # unlimited

    def test_a_plan_without_it_is_refused_before_any_ai_call(self):
        api, frappe, _c = load_api()
        s = SimpleNamespace(enable_ai_fill=1)
        with patch.object(api, "_require_desk_user"), patch.object(api, "_settings", return_value=s), \
                patch.object(api.frappe, "has_permission", create=True), \
                patch.object(api, "_fill_policy", return_value={"enabled": False, "daily_limit": None}), \
                patch.object(api, "_complete") as complete:
            with self.assertRaises(frappe.PermissionError):
                api.extract_document("Purchase Order", "text")
            complete.assert_not_called()

    def test_without_the_platform_app_nothing_is_restricted(self):
        api, _f, _c = load_api()
        self.assertEqual(api._fill_policy(), {"enabled": True, "daily_limit": None})


class DialogTests(unittest.TestCase):
    def test_the_dialog_offers_text_voice_and_a_file_and_hides_without_the_plan(self):
        js = JS.read_text(encoding="utf-8")
        for marker in ("aura-fill-voice", "aura-fill-attach", "SpeechRecognition", "aura.fill_policy", "file_data", "1600"):
            self.assertIn(marker, js, marker)
        self.assertIn("policy.enabled", js)


if __name__ == "__main__":
    unittest.main()
