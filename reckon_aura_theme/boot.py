import frappe


def boot_session(bootinfo):
	"""Attach public theme config to frappe.boot.aura (never secrets)."""
	try:
		from reckon_aura_theme.api import get_public_config

		bootinfo.aura = get_public_config()
	except Exception:
		# Settings DocType may not exist yet (first install / migrate).
		bootinfo.aura = {"enabled": 1}


def clear_theme_cache(doc=None, method=None):
	frappe.clear_cache()
