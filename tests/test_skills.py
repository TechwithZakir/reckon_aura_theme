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
