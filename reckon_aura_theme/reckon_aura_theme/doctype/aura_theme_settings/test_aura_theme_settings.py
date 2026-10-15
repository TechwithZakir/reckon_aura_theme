# Copyright (c) 2026, TechwithZakir and contributors
# For license information, please see license.txt

from unittest.mock import patch

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


class TestAuraApi(IntegrationTestCase):
	def test_parse_json_strips_fences(self):
		self.assertEqual(api._parse_json('```json\n{"party": "ACME"}\n```'), {"party": "ACME"})

	def test_parse_json_rejects_non_object(self):
		self.assertRaises(frappe.ValidationError, api._parse_json, "[1, 2]")
		self.assertRaises(frappe.ValidationError, api._parse_json, "no json here")

	def test_like_escapes_wildcards(self):
		self.assertEqual(api._like("50%_off"), "%50\\%\\_off%")

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
