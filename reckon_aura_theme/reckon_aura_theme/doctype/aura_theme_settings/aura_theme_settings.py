# Copyright (c) 2026, TechwithZakir and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


class AuraThemeSettings(Document):
	def validate(self):
		if self.accent == "Custom" and not self.custom_accent:
			frappe.throw(_("Pick a Custom Accent colour, or choose a preset accent."))
		if self.glass_blur is not None and not (0 <= int(self.glass_blur) <= 40):
			frappe.throw(_("Glass blur must be between 0 and 40 px."))
		if self.ai_base_url:
			self.ai_base_url = self.ai_base_url.strip().rstrip("/")
