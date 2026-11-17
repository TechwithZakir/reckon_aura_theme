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


class CreateMissingTests(unittest.TestCase):
    def run_create(self, policy, settings=None, items=None):
        api, frappe, _c = load_api()
        s = SimpleNamespace(enable_ai_fill=1, get=lambda k: (settings or {}).get(k))
        frappe.has_permission = Mock()
        with patch.object(api, "_require_desk_user"), patch.object(api, "_settings", return_value=s),                 patch.object(api, "_fill_policy", return_value=policy),                 patch.object(api, "_create_party", return_value="ABC Traders") as party,                 patch.object(api, "_create_item", side_effect=lambda t, row: row["name"]) as item:
            try:
                result = api.create_missing("Purchase Order", "ABC Traders", items or [{"name": "Cola 500ml", "qty": 3, "rate": 40}])
            except Exception as exc:
                return exc, party, item, frappe
            return result, party, item, frappe

    def test_it_creates_only_when_the_plan_and_the_setting_allow(self):
        result, party, item, frappe = self.run_create({"enabled": True, "daily_limit": None, "create": True})
        self.assertEqual(result["party"], "ABC Traders")
        self.assertEqual(result["items"], [{"item_code": "Cola 500ml", "qty": 3.0, "rate": 40.0}])
        blocked, party, item, frappe = self.run_create({"enabled": True, "daily_limit": None, "create": False})
        self.assertIsInstance(blocked, frappe.PermissionError)
        party.assert_not_called()
        item.assert_not_called()
        off, party, item, frappe = self.run_create({"enabled": True, "create": True}, settings={"enable_ai_fill_create": 0})
        self.assertIsInstance(off, frappe.PermissionError)

    def test_extraction_asks_before_anything_is_created(self):
        js = JS.read_text(encoding="utf-8")
        # The dialog comes first; the create call only runs from its confirm button.
        self.assertIn("confirm_missing", js)
        self.assertLess(js.index("Create what is missing?"), js.index("reckon_aura_theme.api.create_missing"))
        self.assertIn("Fill without creating", js)
        api_source = API.read_text(encoding="utf-8")
        extract = api_source[api_source.index("def extract_document"):api_source.index("def _default_group")]
        self.assertNotIn("_create_", extract)  # extract_document itself never creates a record


class SidebarToolsTests(unittest.TestCase):
    def test_the_desk_puts_ask_aura_ai_and_a_collapse_button_in_the_sidebar_bottom_group(self):
        js = JS.read_text(encoding="utf-8")
        self.assertIn('document.querySelector(".body-sidebar-bottom")', js)
        self.assertIn("aura-tools aura-tools--sidebar", js)
        self.assertIn('data-aura-action="collapse"', js)
        self.assertIn('document.querySelector(".sidebar-collapse-arrow")', js)  # the Desk's own fold-to-rail control
        self.assertIn('$(document).on("sidebar-expand"', js)
        self.assertLess(js.index("body-sidebar-bottom"), js.index("v16 desktop navbar"))  # the sidebar is tried first

    def test_one_shared_stylesheet_block_serves_the_desk_and_the_crm(self):
        css = (JS.parents[1] / "css" / "aura_desk.css").read_text(encoding="utf-8")
        for selector in (".aura-tools--sidebar", ".aura-side-item", ".aura-tools--sidebar.is-collapsed"):
            self.assertIn(selector, css, selector)


class DockMouseTests(unittest.TestCase):
    def test_no_dock_handler_returns_false_so_mouse_selection_and_focus_work(self):
        js = JS.read_text(encoding="utf-8")
        start = js.index("aura.build_ask = function")
        dock = js[start : js.index("aura.render_ask_welcome = function")]
        # jQuery treats `return false` as preventDefault: it stopped text selection in the whole panel.
        self.assertNotIn("&& aura.close_ask()", dock)
        self.assertNotIn("return false", dock)

    def test_the_launcher_and_panel_are_called_ask_aura_ai(self):
        js = JS.read_text(encoding="utf-8")
        self.assertGreaterEqual(js.count('__("Ask Aura AI")'), 4)


class DialogTests(unittest.TestCase):
    def test_the_dialog_offers_text_voice_and_a_file_and_hides_without_the_plan(self):
        js = JS.read_text(encoding="utf-8")
        for marker in ("aura-fill-voice", "aura-fill-attach", "SpeechRecognition", "aura.fill_policy", "file_data", "1600"):
            self.assertIn(marker, js, marker)
        self.assertIn("policy.enabled", js)


if __name__ == "__main__":
    unittest.main()
