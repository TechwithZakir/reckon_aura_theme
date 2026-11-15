# Copyright (c) 2026, TechwithZakir and contributors
# For license information, please see license.txt

from unittest.mock import Mock, call, patch

import frappe
import requests
from frappe.tests import IntegrationTestCase

from reckon_aura_theme import api, install


class TestAuraThemeSettings(IntegrationTestCase):
	def test_validate_custom_accent_needs_colour(self):
		doc = frappe.get_single("Aura Theme Settings")
		doc.accent = "Custom"
		doc.custom_accent = None
		self.assertRaises(frappe.ValidationError, doc.validate)

	def test_validate_glass_blur_range(self):
		doc = frappe.get_single("Aura Theme Settings")
		doc.accent = "Violet"
		doc.glass_blur = 99
		self.assertRaises(frappe.ValidationError, doc.validate)

	def test_validate_daily_ask_limit_cannot_be_negative(self):
		doc = frappe.get_single("Aura Theme Settings")
		doc.accent = "Violet"
		doc.glass_blur = 18
		doc.ask_ai_daily_limit = -1
		self.assertRaises(frappe.ValidationError, doc.validate)

	def test_base_url_is_normalised(self):
		doc = frappe.get_single("Aura Theme Settings")
		doc.accent = "Violet"
		doc.glass_blur = 18
		doc.ai_base_url = " https://example.com/v1/ "
		doc.validate()
		self.assertEqual(doc.ai_base_url, "https://example.com/v1")

	def test_migrate_keeps_cleared_text(self):
		doc = frappe.get_single("Aura Theme Settings")
		doc.login_headline = ""
		doc.flags.ignore_permissions = True
		doc.save()
		install.after_migrate()
		self.assertFalse(frappe.db.get_single_value("Aura Theme Settings", "login_headline"))

	def test_brand_migration_updates_stock_login_headline(self):
		with (
			patch.object(frappe.db, "exists", return_value=True),
			patch.object(
				frappe.db,
				"get_single_value",
				side_effect=["Frappe", install.OLD_LOGIN_HEADLINE],
			),
			patch.object(frappe.db, "set_single_value") as set_single_value,
			patch.object(frappe, "clear_cache") as clear_cache,
		):
			install.brand_stock_values()

		set_single_value.assert_any_call("Aura Theme Settings", "brand_name", "ReckonERP")
		set_single_value.assert_any_call(
			"Aura Theme Settings", "login_headline", install.DEFAULTS["login_headline"]
		)
		clear_cache.assert_called_once_with()

	def test_brand_migration_preserves_custom_login_headline(self):
		with (
			patch.object(frappe.db, "exists", return_value=True),
			patch.object(frappe.db, "get_single_value", side_effect=["ReckonERP", "My company message"]),
			patch.object(frappe.db, "set_single_value") as set_single_value,
			patch.object(frappe, "clear_cache") as clear_cache,
		):
			install.brand_stock_values()

		set_single_value.assert_not_called()
		clear_cache.assert_not_called()

	def test_daily_ask_limit_migration_seeds_only_missing_value(self):
		with (
			patch.object(frappe.db, "exists", return_value=True),
			patch.object(frappe.db, "get_single_value", return_value=None),
			patch.object(frappe.db, "set_single_value") as set_single_value,
			patch.object(frappe, "clear_cache") as clear_cache,
		):
			install.ensure_daily_ask_limit()
		set_single_value.assert_called_once_with("Aura Theme Settings", "ask_ai_daily_limit", 10)
		clear_cache.assert_called_once_with()

		with (
			patch.object(frappe.db, "exists", return_value=True),
			patch.object(frappe.db, "get_single_value", return_value=0),
			patch.object(frappe.db, "set_single_value") as set_single_value,
			patch.object(frappe, "clear_cache") as clear_cache,
		):
			install.ensure_daily_ask_limit()
		set_single_value.assert_not_called()
		clear_cache.assert_not_called()


class TestAuraApi(IntegrationTestCase):
	def test_parse_json_strips_fences(self):
		self.assertEqual(api._parse_json('```json\n{"party": "ACME"}\n```'), {"party": "ACME"})

	def test_parse_json_rejects_non_object(self):
		self.assertRaises(frappe.ValidationError, api._parse_json, "[1, 2]")
		self.assertRaises(frappe.ValidationError, api._parse_json, "no json here")

	def test_like_escapes_wildcards(self):
		self.assertEqual(api._like("50%_off"), "%50\\%\\_off%")

	def test_accounts_skill_matches_routes_and_bangla_questions(self):
		self.assertTrue(api._needs_accounts_skill("", "Workspaces/Accounts"))
		self.assertTrue(api._needs_accounts_skill("ব্যাংক মিলাব কীভাবে?", ""))
		self.assertFalse(api._needs_accounts_skill("How do I change my password?", "User Profile"))
		self.assertIn("Bank Reconciliation", api._get_accounts_skill("", "query-report/General Ledger"))

	def test_ask_system_prompt_preserves_admin_prompt_and_language_rules(self):
		s = frappe._dict(ai_system_prompt="Use concise bullet points.")
		prompt = api._ask_system_prompt(s)
		self.assertIn("Use concise bullet points.", prompt)
		self.assertIn("same language", prompt)
		self.assertIn("Bangla script", prompt)

	def test_ask_passes_accounts_guide_to_ai(self):
		settings = frappe._dict(enable_ai_bar=1, ask_ai_daily_limit=0, ai_system_prompt="")
		with (
			patch.object(api, "_require_desk_user"),
			patch.object(api, "_settings", return_value=settings),
			patch.object(api, "_require_ai"),
			patch.object(api, "_company_currency", return_value=("Example Co", "USD")),
			patch.object(api, "_build_brief", return_value=[]),
			patch.object(api, "_ask_records", return_value={}),
			patch.object(frappe.utils, "get_fullname", return_value="Test User"),
			patch.object(api, "_complete", return_value="Check the statement lines.") as complete,
		):
			result = api.ask("How do I reconcile a bank statement?", "Workspaces/Accounts")

		self.assertEqual(result["answer"], "Check the statement lines.")
		system_prompt, user_prompt = complete.call_args.args[1:]
		self.assertIn("same language", system_prompt)
		self.assertIn("<support_guide>", user_prompt)
		self.assertIn("Bank Reconciliation", user_prompt)

	def test_daily_ask_quota_is_atomic_and_per_user(self):
		cache = Mock()
		cache.incrby.return_value = 1
		settings = frappe._dict(ask_ai_daily_limit=10)
		with (
			patch.object(api, "_cache", return_value=cache),
			patch.object(api, "nowdate", return_value="2026-11-15"),
			patch.object(api.frappe, "session", frappe._dict(user="quota@example.com")),
		):
			api._consume_daily_ask_quota(settings)

		cache.incrby.assert_called_once_with("aura_ask_daily::quota@example.com::2026-11-15", 1)
		cache.expire.assert_called_once_with("aura_ask_daily::quota@example.com::2026-11-15", 172800)

	def test_daily_ask_quota_rejects_over_limit_and_zero_is_unlimited(self):
		cache = Mock()
		cache.incrby.return_value = 11
		settings = frappe._dict(ask_ai_daily_limit=10)
		with (
			patch.object(api, "_cache", return_value=cache),
			patch.object(api, "nowdate", return_value="2026-11-15"),
			patch.object(api.frappe, "session", frappe._dict(user="quota@example.com")),
			patch.object(api.frappe, "throw", side_effect=frappe.TooManyRequestsError),
		):
			self.assertRaises(frappe.TooManyRequestsError, api._consume_daily_ask_quota, settings)
		self.assertEqual(
			cache.incrby.call_args_list,
			[
				call("aura_ask_daily::quota@example.com::2026-11-15", 1),
				call("aura_ask_daily::quota@example.com::2026-11-15", -1),
			],
		)

		cache.incrby.return_value = 0
		settings.ask_ai_daily_limit = 0
		with patch.object(api, "_cache") as get_cache:
			api._consume_daily_ask_quota(settings)
		get_cache.assert_not_called()

	def test_brief_runs_for_admin(self):
		self.assertIsInstance(api._build_brief(), list)

	def test_ai_endpoints_reject_website_users(self):
		email = "aura-portal@example.com"
		if not frappe.db.exists("User", email):
			frappe.get_doc(
				{"doctype": "User", "email": email, "first_name": "Portal", "user_type": "Website User"}
			).insert(ignore_permissions=True)
		frappe.set_user(email)
		try:
			self.assertRaises(frappe.PermissionError, api.get_brief)
		finally:
			frappe.set_user("Administrator")

	def test_quiet_completion_raises_without_message(self):
		s = frappe.get_single("Aura Theme Settings")
		s.ai_model = "test-model"
		frappe.local.message_log = []
		with (
			patch.object(api, "_api_key", return_value="k"),
			patch.object(api.requests, "post", side_effect=requests.ConnectionError("down")),
		):
			self.assertRaises(api.AuraAIError, api._complete, s, "sys", "user", quiet=True)
		self.assertEqual(frappe.local.message_log, [])
