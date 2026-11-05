/* Reckon Aura Theme — auth page hero (login / update-password). */
(function () {
	"use strict";
	const path = document.body && document.body.getAttribute("data-path");
	if (path !== "login" && path !== "update-password") return;

	const esc = (v) =>
		String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
	const t = (s) => (window.__ ? window.__(s) : s);

	const ICONS = {
		globe: '<path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
		mail: '<path d="M3 6h18v12H3zM3 7l9 7 9-7"/>',
		phone: '<path d="M6 3h4l1.5 5-2 1.5a11 11 0 0 0 5 5l1.5-2 5 1.5v4a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-3z"/>',
	};
	const icon = (name) =>
		`<span class="aura-login-ic"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name]}</svg></span>`;

	function contactList(k) {
		if (!k) return "";
		const row = (ic, label, href, text, external) =>
			`<li>${icon(ic)}<span class="aura-login-label">${t(label)}: </span><a href="${esc(href)}"${
				external ? ' target="_blank" rel="noopener"' : ""
			}>${esc(text)}</a></li>`;
		return `<ul class="aura-login-contact">
			${row("globe", "Website", k.website, k.website_label || k.website, true)}
			${row("mail", "Mail Address", "mailto:" + k.email, k.email)}
			${row("phone", "WhatsApp / Cell", "https://wa.me/" + k.whatsapp_number, k.whatsapp, true)}
		</ul>`;
	}

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

		const brand = esc(c.brand_name || "ReckonERP");
		const logoUrl = c.brand_logo || "/assets/reckon_aura_theme/images/reckonerp-logo.webp";
		const logo = `<img src="${esc(logoUrl)}" alt="">`;
		const hero = document.createElement("aside");
		hero.className = "aura-login-hero";
		hero.innerHTML = `
			<div class="aura-login-brand">${logo}<span>${brand}</span></div>
			<div class="aura-login-copy">
				<h1>${esc(c.headline || t("Your ERP, now with an AI that reads every ledger."))}</h1>
				${c.tagline ? `<p>${esc(c.tagline)}</p>` : ""}
			</div>
			<div class="aura-login-foot">
				${contactList(c.contact)}
				${c.footer ? `<p>${esc(c.footer)}</p>` : ""}
				<p>&copy; ${new Date().getFullYear()} ${esc(c.owner || "Reckon Technologies Ltd.")}</p>
				<p class="aura-login-powered">${esc(c.powered_by || t("Powered by ReckonERP"))}</p>
			</div>`;
		document.body.prepend(hero);
		document.body.classList.add("aura-login");
	}

	fetch("/api/method/reckon_aura_theme.api.get_login_config", { credentials: "same-origin" })
		.then((r) => (r.ok ? r.json() : {}))
		.then((r) => render(r.message || {}))
		.catch(() => render({}));
})();
