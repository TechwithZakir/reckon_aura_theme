/* Reckon Aura Theme — auth page hero (login / update-password). */
(function () {
	"use strict";
	const path = document.body && document.body.getAttribute("data-path");
	if (path !== "login" && path !== "update-password") return;

	const esc = (v) =>
		String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
	const t = (s) => (window.__ ? window.__(s) : s);

	function render(c) {
		if (!c || c.enabled === 0) {
			document.querySelectorAll('link[href*="reckon_aura_theme/css/aura_web"]').forEach((l) => (l.disabled = true));
			return;
		}
		if (c.accent && c.accent !== "custom") document.body.setAttribute("data-aura-accent", c.accent);
		if (c.accent === "custom" && c.custom_accent) {
			document.body.style.setProperty("--aura-accent", c.custom_accent);
			document.body.style.setProperty("--aura-accent-2", c.custom_accent_2 || c.custom_accent);
		}
		if (document.querySelector(".aura-login-hero")) return;

		const brand = esc(c.brand_name || "ERPNext");
		const logo = c.brand_logo ? `<img src="${esc(c.brand_logo)}" alt="">` : `<span class="aura-login-mark">✦</span>`;
		const hero = document.createElement("aside");
		hero.className = "aura-login-hero";
		hero.setAttribute("aria-hidden", "true");
		hero.innerHTML = `
			<div class="aura-login-brand">${logo}<span>${brand}</span></div>
			<div class="aura-login-copy">
				<h1>${esc(c.headline || t("Your ERP, now with an AI that reads every ledger."))}</h1>
				${c.tagline ? `<p>${esc(c.tagline)}</p>` : ""}
			</div>
			<div class="aura-login-foot">${c.footer ? `<span>${esc(c.footer)}</span>` : ""}<span>${t("Powered by Frappe")}</span></div>`;
		document.body.prepend(hero);
		document.body.classList.add("aura-login");
	}

	fetch("/api/method/reckon_aura_theme.api.get_login_config", { credentials: "same-origin" })
		.then((r) => (r.ok ? r.json() : {}))
		.then((r) => render(r.message || {}))
		.catch(() => render({}));
})();
