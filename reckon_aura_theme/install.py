import frappe

SETTINGS = "Aura Theme Settings"

DEFAULTS = {
	"enable_theme": 1,
	"accent": "Violet",
	"density": "Comfortable",
	"glass_blur": 18,
	"aurora_background": 1,
	"allow_user_override": 1,
	"enable_ai_bar": 1,
	"enable_ai_brief": 1,
	"enable_ai_fill": 1,
	"ai_provider": "OpenAI Compatible",
	"login_headline": "Your ERP, now with an AI that reads every ledger.",
	"login_tagline": "Invoices, orders, stock and people — one calm, glass-clear workspace.",
}


def after_install():
	ensure_settings()


def after_migrate():
	# Only seed a site whose settings were never saved. Re-seeding on every migrate
	# would bring back text an admin cleared on purpose (e.g. the login headline).
	if not frappe.db.exists("DocType", SETTINGS):
		return
	if not frappe.db.sql("select 1 from `tabSingles` where doctype=%s limit 1", SETTINGS):
		ensure_settings()


def ensure_settings():
	if not frappe.db.exists("DocType", SETTINGS):
		return
	doc = frappe.get_single(SETTINGS)
	for field, value in DEFAULTS.items():
		if doc.get(field) in (None, ""):
			doc.set(field, value)
	if not doc.brand_name:
		doc.brand_name = (
			frappe.db.get_single_value("Website Settings", "app_name")
			or frappe.db.get_single_value("System Settings", "app_name")
			or "ERPNext"
		)
	doc.flags.ignore_permissions = True
	doc.flags.ignore_mandatory = True
	doc.save()
	frappe.db.commit()
