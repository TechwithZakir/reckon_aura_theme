"""Aura AI skills: every ReckonERP product has a guide, every guide teaches prompts, and the prompts shown are routed.

Runs without a Frappe site. When a product ships or its behaviour changes, update its guide in
reckon_aura_theme/skills (see skills/README.md); the checks below keep that from being forgotten.
"""

import importlib.util
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("aura_test_support", HERE / "test_fill_with_ai.py")
support = importlib.util.module_from_spec(spec)
sys.modules.setdefault("aura_test_support", support)
spec.loader.exec_module(support)

# One guide per ReckonERP product. Add the new product here, and its guide under skills/, when a module is built.
PRODUCT_GUIDES = {
    "reckonbooks": "reckonbooks_skills.md",
    "reckon_hrms": "reckon_hrms_skills.md",
    "distribution": "distribution_skills.md",
    "reckon_crm": "reckon_crm_skills.md",
    "sales_agent": "sales_agent_skills.md",
    "account_platform": "account_platform_skills.md",
    "retail_loyalty": "retail_loyalty_skills.md",
}


class GuideTests(unittest.TestCase):
    def setUp(self):
        self.api, self.frappe, _cache = support.load_api()
        self.by_id = {g["id"]: g for g in self.api.SKILL_GUIDES}

    def test_every_product_has_a_guide_that_is_registered_and_present(self):
        for guide_id, file in PRODUCT_GUIDES.items():
            with self.subTest(guide=guide_id):
                self.assertIn(guide_id, self.by_id)
                self.assertEqual(self.by_id[guide_id]["file"], file)
                self.assertTrue((self.api.SKILLS_DIR / file).exists())

    def test_guides_are_bounded_and_routed(self):
        ids = [g["id"] for g in self.api.SKILL_GUIDES]
        self.assertEqual(len(ids), len(set(ids)))
        for guide in self.api.SKILL_GUIDES:
            with self.subTest(guide=guide["id"]):
                text = (self.api.SKILLS_DIR / guide["file"]).read_text(encoding="utf-8")
                self.assertLessEqual(len(text), self.api.MAX_SKILL_CHARACTERS)
                self.assertTrue(guide["routes"] or guide["markers"])
        playbook = (self.api.SKILLS_DIR / self.api.PLAYBOOK_FILE).read_text(encoding="utf-8")
        self.assertLessEqual(len(playbook), 8000)  # it rides with every question
        for needle in ("Helpdesk", "Copilot", "Autopilot", "autonomous agent", "Prompt guidelines"):
            self.assertIn(needle, playbook)

    def test_every_product_guide_teaches_prompts_in_english_and_bangla(self):
        for guide_id, file in PRODUCT_GUIDES.items():
            with self.subTest(guide=guide_id):
                self.assertGreaterEqual(len(self.api._guide_prompts(file)), 6)
                self.assertGreaterEqual(len(self.api._guide_prompts(file, bangla=True)), 2)
        self.assertGreaterEqual(len(self.api._guide_prompts(self.api.PLAYBOOK_FILE)), 4)

    def test_a_product_route_or_question_selects_its_own_guide_first(self):
        cases = (
            ("", "reckon-hrms/reckon-hrms-hr-studio", "reckon_hrms"),
            ("", "sales-agent/lead-finder", "sales_agent"),
            ("", "accounts-saas/sales-invoice", "reckonbooks"),
            ("How do I run salary in Payroll Studio?", "", "reckon_hrms"),
            ("How does a DSR settle the day?", "", "distribution"),
            ("How do I schedule a field visit?", "", "reckon_crm"),
            ("Which plan includes the free trial?", "", "account_platform"),
        )
        for question, route, expected in cases:
            with self.subTest(question=question, route=route):
                self.assertEqual(self.api._select_skill_guides(question, route)[0]["id"], expected)
        # The generic ERPNext routes still reach the generic guides.
        self.assertEqual(self.api._select_skill_guides("", "Human Resources/Leave Application")[0]["id"], "hr")

    def test_the_playbook_is_attached_to_every_question(self):
        self.assertIn("Helpdesk", self.api._get_playbook())


class PromptTests(unittest.TestCase):
    def setUp(self):
        self.api, self.frappe, _cache = support.load_api()
        patcher = patch.object(self.api, "_require_desk_user")
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_prompts_favour_the_current_product_and_vary_between_calls(self):
        seen = set()
        for _ in range(12):
            prompts = self.api.get_prompts("reckon-hrms/reckon-hrms-setup", 4)
            self.assertEqual(len(prompts), 4)
            self.assertEqual(len({p["text"] for p in prompts}), 4)
            self.assertGreaterEqual(sum(p["module"] == "Reckon HRMS" for p in prompts), 3)
            seen.update(p["text"] for p in prompts)
        self.assertGreater(len(seen), 4)  # random, not a fixed set

    def test_without_a_product_page_prompts_come_from_several_products(self):
        prompts = self.api.get_prompts("", 4)
        self.assertEqual(len(prompts), 4)
        self.assertGreaterEqual(len({p["module"] for p in prompts}), 3)

    def test_bangla_users_get_bangla_prompts(self):
        self.frappe.local = type("Local", (), {"lang": "bn"})()
        prompts = self.api.get_prompts("accounts-saas/sales-invoice", 4)
        own = [p["text"] for p in prompts if p["module"] == "ReckonBooks"]
        self.assertTrue(own and all(any("\u0980" <= ch <= "\u09ff" for ch in text) for text in own))

    def test_count_is_bounded(self):
        self.assertEqual(len(self.api.get_prompts("", 99)), 8)
        self.assertEqual(len(self.api.get_prompts("", 0)), 4)


class LinkTests(unittest.TestCase):
    def setUp(self):
        self.api, self.frappe, _cache = support.load_api()
        patcher = patch.object(self.api, "_require_desk_user")
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_product_guides_list_the_pages_their_answers_name(self):
        for guide_id, file in PRODUCT_GUIDES.items():
            if guide_id == "retail_loyalty":
                continue  # its screens are not documented in this repository yet
            with self.subTest(guide=guide_id):
                links = self.api._guide_links(file)
                self.assertGreaterEqual(len(links), 5)
                for label, url in links:
                    self.assertTrue(label.strip())
                    self.assertTrue((url.startswith("/") and not url.startswith("//")) or url.startswith("https://"), url)

    def test_the_current_products_names_win_a_tie(self):
        books = {r["label"]: r for r in self.api.get_links("accounts-saas/sales-invoice")}
        hrms = {r["label"]: r for r in self.api.get_links("reckon-hrms/reckon-hrms-hr-studio")}
        self.assertEqual(books["Dashboard"]["module"] != "", True)
        self.assertEqual(hrms["Dashboard"]["url"], "/desk/reckon-hrms/reckon-hrms-home")
        self.assertEqual(books["Team and Access"]["url"], "/desk/accounts-saas/accounts-team")
        self.assertEqual(hrms["Shift Type"]["url"], "/desk/reckon-hrms/shift-type")

    def test_unsafe_addresses_are_ignored(self):
        text = "## Links\n\n- Good | /desk/employee\n- Bad | javascript:alert(1)\n- Protocol | //evil.test/x\n- Plain | http://x.test\n"
        self.assertEqual(self.api._parse_links(text), [("Good", "/desk/employee")])

    def test_the_prompt_tells_the_model_to_use_listed_names(self):
        self.assertIn("Links list", self.api.SUPPORT_INSTRUCTIONS)

    def test_the_panel_turns_answers_into_html_and_links_names_in_new_tabs(self):
        js = (HERE.parent / "reckon_aura_theme" / "public" / "js" / "aura_desk.js").read_text(encoding="utf-8")
        for needle in ('target = "_blank"', "noopener noreferrer", "reckon_aura_theme.api.get_links", "aura.autolink", "aura-table"):
            self.assertIn(needle, js)


class ContactTests(unittest.TestCase):
    def test_guides_give_only_the_real_support_contact(self):
        import re

        api, _frappe, _cache = support.load_api()
        allowed_emails = {"support@reckon.tech"}
        for path in api.SKILLS_DIR.glob("*.md"):
            text = path.read_text(encoding="utf-8")
            with self.subTest(guide=path.name):
                found = set(re.findall(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+", text))
                self.assertLessEqual(found, allowed_emails)
        playbook = (api.SKILLS_DIR / api.PLAYBOOK_FILE).read_text(encoding="utf-8")
        self.assertIn("support@reckon.tech", playbook)
        self.assertIn("never invent contact details", playbook.casefold())


class SelectionTests(unittest.TestCase):
    def test_a_subscription_question_reaches_the_account_guide_even_on_another_products_page(self):
        api, _frappe, _cache = support.load_api()
        ids = [g["id"] for g in api._select_skill_guides("How do I add Reckon CRM or Sales AI Agent to my subscription?", "accounts-saas/sales-invoice")]
        self.assertIn("account_platform", ids)
        self.assertLessEqual(len(ids), 3)
