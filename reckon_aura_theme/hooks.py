import hashlib
from pathlib import Path


def _asset_version(*parts):
    """A short fingerprint of an asset file. nginx caches /assets for a year, so the URL must change when the file does."""
    try:
        return hashlib.md5((Path(__file__).parent / "public" / Path(*parts)).read_bytes()).hexdigest()[:10]
    except OSError:
        return "0"


app_name = "reckon_aura_theme"
app_title = "ReckonERP Theme"
app_publisher = "TechwithZakir"
app_description = "ReckonERP theme for Frappe / ERPNext v16"
app_email = "admin@example.com"
app_license = "mit"
app_version = "0.1.0"

required_apps = ["frappe"]

# Desk (/desk). Loaded after Frappe's own bundles, so the token overrides win.
app_include_css = [f"/assets/reckon_aura_theme/css/aura_desk.css?v={_asset_version('css', 'aura_desk.css')}"]
app_include_js = [f"/assets/reckon_aura_theme/js/aura_desk.js?v={_asset_version('js', 'aura_desk.js')}"]

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
