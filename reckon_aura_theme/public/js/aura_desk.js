/* Reckon Aura Theme — desk runtime for Frappe / ERPNext v16
 * - applies site + per-browser theme prefs (accent, density)
 * - navbar tools: Ask AI, density, accent, light/dark
 * - Ask AI command panel (Ctrl/⌘+J): AI answers + offline "jump to" palette
 * - brief card on workspaces
 * - "Fill with AI" on sales / purchase transactions
 */
(function () {
	"use strict";

	frappe.provide("aura");

	const PREF_KEY = "aura:prefs";
	const DISMISS_KEY = "aura:brief-dismissed";
	const ACCENTS = ["violet", "cyan", "ember"];
	const IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
	const IC = {
		rows: "M3 5h18M3 12h18M3 19h18",
		dense: "M3 4h18M3 9h18M3 14h18M3 19h18",
		moon: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z",
		sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4",
		list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
		arrow: "M5 12h14M13 6l6 6-6 6",
		x: "M18 6 6 18M6 6l12 12",
	};

	const esc = (v) => frappe.utils.escape_html(v == null ? "" : String(v));
	const svg = (d, s = 16) =>
		`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
	const cfg = () => (frappe.boot && frappe.boot.aura) || {};
	const on = (v) => v !== 0 && v !== false; // missing keys default to "on"
	const canOverride = () => on(cfg().allow_user_override);
	const readJSON = (k, store = localStorage) => {
		try {
			return JSON.parse(store.getItem(k)) || {};
		} catch (e) {
			return {};
		}
	};
	const prefs = () => (canOverride() ? readJSON(PREF_KEY) : {});
	const setPrefs = (p) => localStorage.setItem(PREF_KEY, JSON.stringify(Object.assign(readJSON(PREF_KEY), p)));

	/* ------------------------------------------------------------ theme */

	aura.apply = function () {
		const c = cfg();
		const root = document.documentElement;
		const sheet = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find((l) =>
			(l.href || "").includes("reckon_aura_theme/css/aura_desk")
		);
		if (c.enabled === 0) {
			if (sheet) sheet.disabled = true;
			root.removeAttribute("data-aura");
			return false;
		}
		const p = prefs();
		const accent = p.accent || c.accent || "violet";
		root.setAttribute("data-aura", "on");
		root.setAttribute("data-aura-accent", accent);
		root.setAttribute("data-aura-density", p.density || c.density || "comfortable");
		root.setAttribute("data-aura-aurora", c.aurora_background === 0 ? "off" : "on");
		root.style.setProperty("--aura-blur", (c.glass_blur != null ? c.glass_blur : 18) + "px");
		if (accent === "custom" && c.custom_accent) {
			root.style.setProperty("--aura-accent", c.custom_accent);
			root.style.setProperty("--aura-accent-2", c.custom_accent_2 || c.custom_accent);
		} else {
			root.style.removeProperty("--aura-accent");
			root.style.removeProperty("--aura-accent-2");
		}
		aura.sync_tool_icons();
		return true;
	};

	aura.accents = () => (cfg().custom_accent ? ACCENTS.concat("custom") : ACCENTS);

	aura.cycle_accent = function () {
		const list = aura.accents();
		const cur = document.documentElement.getAttribute("data-aura-accent") || list[0];
		const next = list[(list.indexOf(cur) + 1) % list.length];
		setPrefs({ accent: next });
		aura.apply();
		frappe.show_alert({ message: __("Accent: {0}", [__(frappe.utils.to_title_case(next))]), indicator: "blue" }, 2);
	};

	aura.toggle_density = function () {
		const cur = document.documentElement.getAttribute("data-aura-density");
		setPrefs({ density: cur === "compact" ? "comfortable" : "compact" });
		aura.apply();
	};

	aura.is_dark = () => document.documentElement.getAttribute("data-theme") === "dark";

	aura.toggle_mode = function () {
		const theme = aura.is_dark() ? "Light" : "Dark";
		const root = document.documentElement;
		root.setAttribute("data-theme", theme.toLowerCase());
		root.setAttribute("data-theme-mode", theme.toLowerCase());
		aura.sync_tool_icons();
		// Persist on the User record, same as Frappe's own theme switcher.
		frappe
			.xcall("frappe.core.doctype.user.user.switch_theme", { theme })
			.then(() => frappe.boot && (frappe.boot.desk_theme = theme))
			.catch(() => {});
	};

	/* ---------------------------------------------------------- toolbar */

	aura.sync_tool_icons = function () {
		const root = document.documentElement;
		const mode = document.querySelector('.aura-tools [data-aura-action="mode"]');
		if (mode) mode.innerHTML = svg(aura.is_dark() ? IC.sun : IC.moon);
		const dens = document.querySelector('.aura-tools [data-aura-action="density"]');
		if (dens) dens.innerHTML = svg(root.getAttribute("data-aura-density") === "compact" ? IC.dense : IC.rows);
	};

	aura.mount_tools = function () {
		if (cfg().enabled === 0 || document.querySelector(".aura-tools")) return;
		const c = cfg();
		const parts = [];
		if (on(c.ai_bar)) {
			parts.push(
				`<button type="button" class="aura-ask-trigger" data-aura-action="ask" title="${__("Ask AI")}">` +
					`<span class="aura-spark">✦</span><span class="aura-ask-text">${__("Ask AI")}</span>` +
					`<kbd>${IS_MAC ? "⌘J" : "Ctrl J"}</kbd></button>`
			);
		}
		if (canOverride()) {
			parts.push(`<button type="button" class="aura-icon-btn" data-aura-action="density" title="${__("Toggle density")}"></button>`);
			parts.push(
				`<button type="button" class="aura-icon-btn" data-aura-action="accent" title="${__("Change accent")}"><span class="aura-swatch"></span></button>`
			);
		}
		parts.push(`<button type="button" class="aura-icon-btn" data-aura-action="mode" title="${__("Light / dark")}"></button>`);

		const el = document.createElement("div");
		el.className = "aura-tools";
		el.innerHTML = parts.join("");

		// v16 desktop navbar → v15 navbar → floating dock fallback.
		const host =
			document.querySelector(".desktop-navbar .navbar-nav") ||
			document.querySelector("header.navbar .navbar-collapse .navbar-nav") ||
			document.querySelector("header.navbar .navbar-nav");
		if (host) {
			el.classList.add("aura-tools--inline");
			if (host.tagName === "UL") {
				const li = document.createElement("li");
				li.className = "nav-item aura-tools-item";
				li.appendChild(el);
				host.insertBefore(li, host.firstChild);
			} else {
				host.insertBefore(el, host.firstChild);
			}
		} else {
			el.classList.add("aura-tools--dock");
			document.body.appendChild(el);
		}
		aura.sync_tool_icons();
	};

	$(document).on("click", ".aura-tools [data-aura-action]", function (e) {
		e.preventDefault();
		const action = this.getAttribute("data-aura-action");
		if (action === "ask") aura.open_ask();
		else if (action === "density") aura.toggle_density();
		else if (action === "accent") aura.cycle_accent();
		else if (action === "mode") aura.toggle_mode();
	});

	/* -------------------------------------------------------- Ask panel */

	const CHIPS = [
		__("What needs my attention today?"),
		__("Summarise overdue invoices"),
		__("How is billing trending this month?"),
		__("Which supplier bills are due this week?"),
	];

	aura.build_ask = function () {
		if (aura.$ask) return aura.$ask;
		const brand = esc(cfg().brand_name || "ERPNext");
		aura.$ask = $(`
			<div class="aura-ask-backdrop" role="presentation">
				<div class="aura-ask" role="dialog" aria-modal="true" aria-label="${__("Ask AI")}">
					<div class="aura-ask-input">
						<span class="aura-spark-badge">✦</span>
						<input type="text" autocomplete="off" spellcheck="false"
							placeholder="${__("Ask {0} AI, or type to jump to a page…", [brand])}">
						<kbd>Esc</kbd>
					</div>
					<div class="aura-ask-chips">${CHIPS.map((c) => `<button type="button" class="aura-chip">${esc(c)}</button>`).join("")}</div>
					<div class="aura-ask-body"></div>
				</div>
			</div>`).appendTo(document.body);

		const $input = aura.$ask.find("input");
		aura.$ask.on("mousedown", (e) => e.target === aura.$ask[0] && aura.close_ask());
		aura.$ask.on("click", ".aura-chip", function () {
			$input.val(this.textContent);
			aura.submit_ask();
		});
		aura.$ask.on("click", ".aura-jump", function () {
			const dt = this.getAttribute("data-doctype");
			aura.close_ask();
			frappe.set_route("List", dt);
		});
		// Keep keyboard focus inside the modal panel.
		aura.$ask.on("keydown", (e) => {
			if (e.key === "Escape") return aura.close_ask();
			if (e.key !== "Tab") return;
			const $f = aura.$ask.find("input, button").filter(":visible");
			if (!$f.length) return;
			const first = $f[0];
			const last = $f[$f.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		});
		$input.on("input", frappe.utils.debounce(() => aura.render_jumps($input.val()), 120));
		$input.on("keydown", (e) => {
			const $items = aura.$ask.find(".aura-jump");
			const $active = $items.filter(".is-active");
			if (e.key === "Escape") aura.close_ask();
			else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
				e.preventDefault();
				let i = $items.index($active) + (e.key === "ArrowDown" ? 1 : -1);
				i = Math.max(0, Math.min($items.length - 1, i));
				$items.removeClass("is-active").eq(i).addClass("is-active");
			} else if (e.key === "Enter") {
				e.preventDefault();
				if ($active.length) $active.trigger("click");
				else aura.submit_ask();
			}
		});
		return aura.$ask;
	};

	aura.open_ask = function () {
		if (!on(cfg().ai_bar)) return;
		const $a = aura.build_ask();
		$a.addClass("is-open");
		const $input = $a.find("input");
		aura.render_jumps($input.val());
		setTimeout(() => $input.trigger("focus").select(), 20);
	};

	aura.close_ask = function () {
		aura.$ask && aura.$ask.removeClass("is-open");
	};

	aura.render_jumps = function (q) {
		const $body = aura.$ask.find(".aura-ask-body");
		$body.find(".aura-jumps").remove();
		const query = (q || "").trim().toLowerCase();
		if (query.length < 2) return;
		const words = query.split(/\s+/);
		const can_read = (frappe.boot.user && frappe.boot.user.can_read) || [];
		const hits = can_read
			.filter((dt) => {
				const label = __(dt).toLowerCase();
				return words.every((w) => label.includes(w));
			})
			.slice(0, 6);
		if (!hits.length) return;
		$body.append(`
			<div class="aura-jumps">
				<div class="aura-ask-label">${__("Jump to")}</div>
				<div class="aura-jump-list">${hits
					.map(
						(dt) =>
							`<button type="button" class="aura-jump" data-doctype="${esc(dt)}">${svg(IC.list)}<span>${esc(__(dt))}</span><small>${__("List")}</small></button>`
					)
					.join("")}</div>
			</div>`);
	};

	aura.format_answer = function (text) {
		return esc(text)
			.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
			.replace(/^\s*[-•]\s+(.+)$/gm, "• $1")
			.replace(/\n/g, "<br>");
	};

	aura.submit_ask = function () {
		const $a = aura.$ask;
		const q = ($a.find("input").val() || "").trim();
		if (!q) return;
		const $body = $a.find(".aura-ask-body");
		$body.find(".aura-answer-wrap").remove();
		const $wrap = $(`<div class="aura-answer-wrap"><div class="aura-ask-label">✦ ${__("Answer")}</div></div>`).prependTo($body);

		if (!cfg().ai_ready) {
			$wrap.append(
				`<div class="aura-answer is-note">${__(
					"AI answers are not set up yet. A System Manager can add a model and API key in Aura Theme Settings. Meanwhile, matching pages are listed below."
				)}</div>`
			);
			return;
		}
		const $ans = $(`<div class="aura-answer"><span class="aura-thinking"><i></i><i></i><i></i></span></div>`).appendTo($wrap);
		frappe
			.xcall("reckon_aura_theme.api.ask", { question: q, route: frappe.get_route_str ? frappe.get_route_str() : "" })
			.then((r) => $ans.html(aura.format_answer((r && r.answer) || __("No answer."))))
			.catch((e) => {
				$ans.addClass("is-error").text(__("Could not get an answer. {0}", [(e && e.message) || ""]));
			});
	};

	$(document).on("keydown.aura", (e) => {
		if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && (e.key === "j" || e.key === "J")) {
			e.preventDefault();
			aura.$ask && aura.$ask.hasClass("is-open") ? aura.close_ask() : aura.open_ask();
		}
	});

	/* ------------------------------------------------------------ brief */

	aura.brief_data = null;
	aura.brief_at = 0;

	aura.render_brief = function (attempt = 0) {
		const c = cfg();
		if (c.enabled === 0 || !on(c.ai_brief)) return;
		const route = frappe.get_route ? frappe.get_route() : [];
		if (!route || route[0] !== "Workspaces") return;
		if (readJSON(DISMISS_KEY, sessionStorage).dismissed) return;

		const page = frappe.container && frappe.container.page;
		const $main = $(page).find(".layout-main-section").first();
		if (!$main.length) {
			// Workspace body renders after the route event — retry briefly.
			if (attempt < 10) setTimeout(() => aura.render_brief(attempt + 1), 300);
			return;
		}
		if ($main.children(".aura-brief").length) return;

		const $card = $(`
			<section class="aura-brief" aria-label="${__("Brief")}">
				<button type="button" class="aura-brief-close" title="${__("Hide for this session")}">${svg(IC.x, 14)}</button>
				<div class="aura-brief-head">
					<div class="aura-brief-title"><span class="aura-spark-badge">✦</span>${__("Today's brief")}</div>
					<div class="aura-brief-headline"></div>
					<div class="aura-brief-meta">${__("From records you can access")}</div>
				</div>
				<div class="aura-brief-items"><div class="aura-skel"></div><div class="aura-skel"></div><div class="aura-skel"></div></div>
			</section>`).prependTo($main);

		$card.on("click", ".aura-brief-close", () => {
			sessionStorage.setItem(DISMISS_KEY, JSON.stringify({ dismissed: 1 }));
			$(".aura-brief").remove();
		});

		const fresh = aura.brief_data && Date.now() - aura.brief_at < 5 * 60 * 1000;
		const load = fresh
			? Promise.resolve(aura.brief_data)
			: frappe.xcall("reckon_aura_theme.api.get_brief").then((r) => {
					aura.brief_data = r;
					aura.brief_at = Date.now();
					return r;
			  });

		load
			.then((r) => {
				const items = (r && r.insights) || [];
				if (!items.length) return $card.remove();
				$card.find(".aura-brief-headline").text(r.headline || "");
				if (r.ai) $card.find(".aura-brief-meta").text(__("Summarised by AI from records you can access"));
				$card.find(".aura-brief-items").html(
					items
						.map(
							(it, i) =>
								`<div class="aura-brief-item" data-tone="${esc(it.tone)}"><div>${esc(it.text)}</div>` +
								(it.cta ? `<button type="button" data-i="${i}">${esc(it.cta)}</button>` : "") +
								`</div>`
						)
						.join("")
				);
				$card.on("click", ".aura-brief-item button", function () {
					const it = items[+this.getAttribute("data-i")];
					if (it && it.route) frappe.set_route(...it.route);
				});
			})
			.catch(() => $card.remove());
	};

	/* ---------------------------------------------------- Fill with AI */

	const FILL = {
		"Sales Invoice": { party: "customer", date: "due_date" },
		"Sales Order": { party: "customer", date: "delivery_date" },
		"Delivery Note": { party: "customer" },
		Quotation: { party: "party_name", date: "valid_till" },
		"Purchase Order": { party: "supplier", date: "schedule_date" },
		"Purchase Invoice": { party: "supplier", date: "due_date" },
		"Purchase Receipt": { party: "supplier" },
	};

	aura.add_fill_button = function (frm) {
		const c = cfg();
		if (c.enabled === 0 || !on(c.ai_fill) || !c.ai_ready || frm.doc.docstatus !== 0) return;
		if (!frappe.model.can_create(frm.doctype)) return;
		const $btn = frm.add_custom_button("✦ " + __("Fill with AI"), () => aura.fill_dialog(frm));
		$btn && $btn.addClass && $btn.addClass("aura-fill-btn");
	};

	aura.fill_dialog = function (frm) {
		const d = new frappe.ui.Dialog({
			title: "✦ " + __("Fill with AI"),
			size: "large",
			fields: [
				{
					fieldtype: "HTML",
					fieldname: "hint",
					options: `<p class="text-muted" style="margin-bottom:8px">${__(
						"Paste a purchase order, an email or rough notes. AI finds the party, items, quantities and rates, matches them to your masters, and fills this {0}. Nothing is saved until you click Save.",
						[__(frm.doctype)]
					)}</p>`,
				},
				{ fieldtype: "Small Text", fieldname: "source", label: __("Source text"), reqd: 1 },
				{
					fieldtype: "Check",
					fieldname: "replace_items",
					label: __("Replace existing item rows"),
					default: 1,
				},
			],
			primary_action_label: __("Fill form"),
			primary_action: (values) => {
				const $p = d.get_primary_btn();
				$p.prop("disabled", true).text(__("Reading…"));
				frappe
					.xcall("reckon_aura_theme.api.extract_document", { doctype: frm.doctype, text: values.source })
					.then((r) => aura.apply_extraction(frm, r, values.replace_items))
					.then(() => d.hide())
					.catch(() => $p.prop("disabled", false).text(__("Fill form")));
			},
		});
		d.$wrapper.addClass("aura-fill-dialog");
		d.show();
	};

	aura.apply_extraction = async function (frm, r, replace) {
		const map = FILL[frm.doctype];
		if (!r) return;
		if (frm.doctype === "Quotation" && r.party) await frm.set_value("quotation_to", r.party_type || "Customer");
		if (r.party) await frm.set_value(map.party, r.party);
		const date = map.date === "delivery_date" || map.date === "schedule_date" ? r.delivery_date : r.due_date;
		if (map.date && date && frm.fields_dict[map.date]) await frm.set_value(map.date, date);

		const items = r.items || [];
		if (items.length) {
			if (replace) frm.clear_table("items");
			// item_code / qty triggers fetch item details and price-list rates over ajax;
			// wait for them to settle so the AI rate is not overwritten afterwards.
			const settle = () => new Promise((resolve) => frappe.after_ajax(resolve));
			for (const it of items) {
				const row = frm.add_child("items");
				await frappe.model.set_value(row.doctype, row.name, "item_code", it.item_code);
				await settle();
				if (it.qty) {
					await frappe.model.set_value(row.doctype, row.name, "qty", it.qty);
					await settle();
				}
				if (it.rate) {
					await frappe.model.set_value(row.doctype, row.name, "rate", it.rate);
					await settle();
				}
			}
			frm.refresh_field("items");
		}

		const notes = [];
		if (!r.party && r.party_text) notes.push(__("{0} not found: {1}", [__(r.party_type), r.party_text]));
		if ((r.unmatched || []).length) notes.push(__("Items not found: {0}", [r.unmatched.join(", ")]));
		frappe.show_alert(
			{
				message: __("AI filled {0} item row(s).", [items.length]) + (notes.length ? " " + notes.join(" · ") : ""),
				indicator: notes.length ? "orange" : "green",
			},
			notes.length ? 10 : 5
		);
	};

	Object.keys(FILL).forEach((doctype) =>
		frappe.ui.form.on(doctype, { refresh: (frm) => aura.add_fill_button(frm) })
	);

	/* ------------------------------------------------------------- boot */

	const on_route = frappe.utils.debounce(() => {
		aura.mount_tools();
		aura.render_brief();
	}, 150);

	aura.init = function () {
		if (aura._ready) return;
		aura._ready = true;
		if (!aura.apply()) return;
		aura.mount_tools();
		if (frappe.router && typeof frappe.router.on === "function") frappe.router.on("change", on_route);
		$(document).on("page-change", on_route);
		on_route();
	};

	aura.apply(); // as early as possible to avoid a flash of wrong accent
	$(document).on("app_ready", aura.init);
	$(() => frappe.boot && frappe.boot.user && setTimeout(aura.init, 0));
})();
