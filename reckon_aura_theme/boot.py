import frappe


def boot_session(bootinfo):
	"""Attach public theme config to frappe.boot.aura (never secrets)."""
	try:
		from reckon_aura_theme.api import get_public_config

		bootinfo.aura = get_public_config()
	except Exception:
		# Settings DocType may not exist yet (first install / migrate).
		bootinfo.aura = {"enabled": 1}
	bootinfo.reckon_pages = reckon_page_names()


def clear_theme_cache(doc=None, method=None):
	frappe.clear_cache()


def reckon_page_names():
	"""Names of the custom desk pages that ship with the Reckon apps, so the desk can give each a white container."""
	try:
		modules = []
		for app in frappe.get_installed_apps():
			if app.startswith("reckon"):
				modules += frappe.get_module_list(app)
		if not modules:
			return []
		return frappe.get_all("Page", filters={"module": ["in", modules]}, pluck="name")
	except Exception:
		return []
