app_name = "reckon_aura_theme"
app_title = "Reckon Aura Theme"
app_publisher = "TechwithZakir"
app_description = "Aurora Glass — an AI-first desk theme for Frappe / ERPNext v16"
app_email = "admin@example.com"
app_license = "mit"
app_version = "0.1.0"

required_apps = ["frappe"]

# Desk (/desk). Loaded after Frappe's own bundles, so the token overrides win.
app_include_css = ["/assets/reckon_aura_theme/css/aura_desk.css"]
app_include_js = ["/assets/reckon_aura_theme/js/aura_desk.js"]

# Website. The stylesheet only targets the auth pages (body[data-path=login] etc.),
# so the public website / portal keeps its own Website Theme.
web_include_css = ["/assets/reckon_aura_theme/css/aura_web.css"]
web_include_js = ["/assets/reckon_aura_theme/js/aura_web.js"]

# Theme + AI configuration is shipped to the client in frappe.boot.aura
extend_bootinfo = "reckon_aura_theme.boot.boot_session"

after_install = "reckon_aura_theme.install.after_install"
after_migrate = "reckon_aura_theme.install.after_migrate"

# Settings changes must reach every session.
doc_events = {
	"Aura Theme Settings": {
		"on_update": "reckon_aura_theme.boot.clear_theme_cache",
	}
}
