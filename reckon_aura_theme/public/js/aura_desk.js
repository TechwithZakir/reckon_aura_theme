/* Reckon Aura AI — desk runtime for Frappe / ERPNext v16
 * - applies site + per-browser theme prefs (accent, density)
 * - navbar tools: Aura AI, density, accent, light/dark
 * - Aura AI chat (Ctrl/⌘+J): multi-turn ERP support with voice input and page jumps
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
		dock: "M4 4h16v16H4zM10 4v16",
		newChat: "M12 5v14M5 12h14",
		mic: "M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM19 11a7 7 0 0 1-14 0M12 18v4M8 22h8",
		send: "M22 2 11 13M22 2 15 22 11 13 2 9 22 2",
		select: "M8 5h12v14H8zM4 17V3h14",
		collapse: "M15 18l-6-6 6-6",
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

	// Collapse / Expand at the bottom of the sidebar, as the CRM sidebar has: it folds the sidebar to its rail and back.
	aura.sync_collapse_row = function () {
		const row = document.querySelector(".aura-sidebar-collapse");
		if (!row) return;
		const collapsed = document.body.classList.contains("sidebar-collapsed");
		row.classList.toggle("is-collapsed", collapsed);
		const label = row.querySelector(".aura-side-label");
		if (label) label.textContent = collapsed ? __("Expand") : __("Collapse");
		row.querySelector("button").setAttribute("title", collapsed ? __("Expand sidebar") : __("Collapse sidebar"));
	};
	aura.mount_collapse = function () {
		if (cfg().enabled === 0) return;
		const host = document.querySelector(".body-sidebar-bottom");
		if (!host || host.querySelector(".aura-sidebar-collapse")) return;
		const row = document.createElement("div");
		row.className = "aura-sidebar-collapse";
		row.innerHTML = `<button type="button" class="aura-side-item" data-aura-collapse>${svg(IC.collapse, 15)}<span class="aura-side-label"></span></button>`;
		host.insertBefore(row, host.firstChild);
		aura.sync_collapse_row();
	};
	$(document).on("click", ".aura-sidebar-collapse [data-aura-collapse]", () => {
		const arrow = document.querySelector(".sidebar-collapse-arrow");
		if (arrow) arrow.click();
		setTimeout(() => aura.sync_collapse_row(), 0);
	});
	$(document).on("sidebar-expand", () => setTimeout(() => aura.sync_collapse_row(), 0));

	aura.mount_tools = function () {
		const c = cfg();
		if (c.enabled === 0 || !on(c.ai_bar)) {
			aura.close_ask();
			document.querySelectorAll('.aura-tools [data-aura-action="ask"]').forEach((el) => el.remove());
		}
		if (c.enabled === 0 || document.querySelector(".aura-tools")) return;
		const parts = [];
		if (on(c.ai_bar)) {
			parts.push(
				`<button type="button" class="aura-ask-trigger" data-aura-action="ask" title="${__("Ask Aura AI")}">` +
					`<span class="aura-spark">✦</span><span class="aura-ask-text">${__("Ask Aura AI")}</span>` +
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

	aura.ask_history = [];
	aura.ask_pending = false;
	aura.ask_recognition = null;

	aura.build_ask = function () {
		if (aura.$ask) return aura.$ask;
		const brand = esc(cfg().brand_name || "ReckonERP");
		aura.$ask = $(`
			<div class="aura-ask-backdrop" role="presentation">
				<section class="aura-ask" role="dialog" aria-modal="true" aria-label="${__("Ask Aura AI")}">
					<header class="aura-ask-header">
						<div class="aura-ask-brand">
							<span class="aura-spark-badge">✦</span>
							<div><strong>${__("Ask Aura AI")}</strong><small>${__("ERP support assistant")}</small></div>
						</div>
						<div class="aura-ask-actions">
							<button type="button" class="aura-ask-tool" data-aura-ask-action="new-chat" title="${__(
								"New chat"
							)}" aria-label="${__("New chat")}">${svg(IC.newChat, 15)}</button>
							<button type="button" class="aura-ask-tool" data-aura-ask-action="dock" aria-pressed="false" title="${__(
								"Dock to right"
							)}" aria-label="${__("Dock to right")}">${svg(IC.dock, 15)}</button>
							<button type="button" class="aura-ask-tool" data-aura-ask-action="close" title="${__(
								"Close"
							)}" aria-label="${__("Close")}">${svg(IC.x, 15)}</button>
							<kbd>Esc</kbd>
						</div>
					</header>
					<div class="aura-ask-body">
						<div class="aura-ask-messages" role="log" aria-live="polite" aria-relevant="additions"></div>
					</div>
					<footer class="aura-ask-composer">
						<div class="aura-ask-compose">
							<textarea rows="1" maxlength="2000" autocomplete="off" spellcheck="true"
								placeholder="${__("Message Aura AI…")}" aria-label="${__("Message")}"></textarea>
							<div class="aura-ask-compose-actions">
								<button type="button" class="aura-ask-tool aura-ask-select-input" title="${__(
									"Select all input"
								)}" aria-label="${__("Select all input")}">${svg(IC.select, 15)}</button>
								<button type="button" class="aura-ask-tool aura-ask-voice" data-aura-ask-action="voice"
									aria-pressed="false" title="${__("Start voice input")}" aria-label="${__("Start voice input")}">${svg(IC.mic, 16)}</button>
								<button type="button" class="aura-ask-send" data-aura-ask-action="send"
									title="${__("Send message")}" aria-label="${__("Send message")}">${svg(IC.send, 16)}</button>
							</div>
						</div>
						<div class="aura-ask-disclaimer">${__("Enter to send · Shift+Enter for a new line · AI can make mistakes")}</div>
					</footer>
				</section>
			</div>`).appendTo(document.body);
		const $textarea = aura.$ask.find("textarea");
		aura.render_ask_welcome();
		aura.$ask.on("mousedown", (e) => {
			// Only a press on the empty backdrop closes the panel. A jQuery handler must not give back false: that cancels
			// the browser's default for every press inside the panel (text selection and focus), which is what broke it.
			if (e.target === aura.$ask[0]) aura.close_ask();
		});
		// Clicking anywhere in the message box (not only on its one text line) puts the cursor in it.
		aura.$ask.on("mousedown", ".aura-ask-compose", (e) => {
			if (e.target === $textarea[0] || $(e.target).closest("button").length) return;
			e.preventDefault();
			$textarea[0].focus();
		});
		// Desk forms and refreshes pull focus to their own first field. While the person is working in this panel,
		// give focus back, but never when they have just clicked somewhere else on purpose.
		let lastInside = 0, lastOutside = 0;
		const inside = (target) => aura.$ask[0].contains(target);
		document.addEventListener("mousedown", (e) => { if (inside(e.target)) lastInside = Date.now(); else lastOutside = Date.now(); }, true);
		document.addEventListener("keydown", (e) => { if (inside(e.target)) lastInside = Date.now(); }, true);
		document.addEventListener("focusin", (e) => {
			if (!aura.$ask.hasClass("is-open") || inside(e.target)) return;
			if (lastInside > lastOutside && Date.now() - lastInside < 4000) setTimeout(() => $textarea[0].focus(), 0);
		}, true);
		aura.$ask.on("click", ".aura-ask-select-input", function () {
			$textarea[0].focus();
			$textarea[0].select();
		});
		aura.$ask.on("click", "[data-aura-select-output]", function () {
			const answer = $(this).closest(".aura-chat-turn").find(".aura-chat-content")[0];
			if (!answer) return;
			const selection = window.getSelection();
			if (!selection) return;
			const range = document.createRange();
			range.selectNodeContents(answer);
			selection.removeAllRanges();
			selection.addRange(range);
		});
		aura.$ask.on("click", "[data-aura-ask-action]", function () {
			const action = this.getAttribute("data-aura-ask-action");
			if (action === "dock") aura.toggle_ask_dock();
			else if (action === "new-chat") aura.new_ask_chat();
			else if (action === "voice") aura.toggle_ask_voice();
			else if (action === "send") aura.submit_ask();
			else if (action === "more-ideas") aura.load_prompt_chips();
			else if (action === "close") aura.close_ask();
		});
		aura.$ask.on("click", ".aura-chip", function () {
			$textarea.val(this.textContent);
			aura.submit_ask();
		});
		aura.$ask.on("click", ".aura-jump", function () {
			const dt = this.getAttribute("data-doctype");
			aura.close_ask();
			frappe.set_route("List", dt);
		});
		aura.$ask.on("keydown", (e) => {
			if (e.key === "Escape") return aura.close_ask();
			if (e.key !== "Tab" || aura.$ask.hasClass("is-docked")) return;
			const $f = aura.$ask.find("textarea, button:not(:disabled)").filter(":visible");
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
		$textarea.on("input", frappe.utils.debounce(() => {
			aura.resize_ask_input();
			aura.render_jumps($textarea.val());
		}, 120));
		$textarea.on("keydown", (e) => {
			const $items = aura.$ask.find(".aura-jump");
			const $active = $items.filter(".is-active");
			if ((e.key === "ArrowDown" || e.key === "ArrowUp") && $items.length) {
				e.preventDefault();
				let i = $items.index($active) + (e.key === "ArrowDown" ? 1 : -1);
				i = Math.max(0, Math.min($items.length - 1, i));
				$items.removeClass("is-active").eq(i).addClass("is-active");
			} else if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				if ($active.length) $active.trigger("click");
				else aura.submit_ask();
			}
		});
		const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!Recognition) {
			aura.$ask.find(".aura-ask-voice")
				.prop("disabled", true)
				.attr("title", __("Voice input is not supported in this browser"));
		}
		return aura.$ask;
	};

	aura.render_ask_welcome = function () {
		if (!aura.$ask) return;
		const brand = esc(cfg().brand_name || "ReckonERP");
		aura.$ask.find(".aura-ask-messages").html(`
			<div class="aura-ask-welcome">
				<span class="aura-ask-welcome-icon">✦</span>
				<h2>${__("How can I help with {0}?", [brand])}</h2>
				<p>${__("Ask about your ReckonERP products, errors, workflows, or what to do next.")}</p>
				<div class="aura-ask-chips">${CHIPS.map((c) => `<button type="button" class="aura-chip">${esc(c)}</button>`).join("")}</div>
				<button type="button" class="aura-more-ideas" data-aura-ask-action="more-ideas">${__("Show other ideas")}</button>
			</div>`);
		aura.load_prompt_chips();
		aura.load_links();
	};

	/* Ideas worth asking, picked at random from the guides of the product on screen (and a few from the others). */
	aura.load_prompt_chips = function () {
		if (!aura.$ask) return;
		const route = frappe.get_route_str ? frappe.get_route_str() : "";
		frappe
			.xcall("reckon_aura_theme.api.get_prompts", { route, count: 4 }, "GET")
			.then((rows) => {
				const $box = aura.$ask && aura.$ask.find(".aura-ask-chips");
				if (!$box || !$box.length || !rows || !rows.length) return;
				$box.html(
					rows
						.map((r) => `<button type="button" class="aura-chip" title="${esc(r.module)}">${esc(r.text)}</button>`)
						.join(""),
				);
			})
			.catch(() => {}); // the built-in ideas stay when the call fails
	};

	aura.render_ask_message = function (role, content, state) {
		const isUser = role === "user";
		const $turn = isUser
			? $(`<article class="aura-chat-turn aura-chat-turn--user"><div class="aura-chat-bubble"></div></article>`)
			: $(`<article class="aura-chat-turn aura-chat-turn--assistant">
					<div class="aura-chat-avatar">✦</div>
					<div class="aura-chat-message">
						<div class="aura-chat-label">${esc(cfg().brand_name || "ReckonERP")}</div>
						<div class="aura-chat-content"></div>
						<button type="button" class="aura-ask-tool aura-chat-select" data-aura-select-output
							title="${__("Select all answer")}" aria-label="${__("Select all answer")}">${svg(IC.select, 13)}</button>
					</div>
				</article>`);

		if (isUser) {
			$turn.find(".aura-chat-bubble").text(content);
		} else {
			const $content = $turn.find(".aura-chat-content");
			if (state === "pending") {
				$content.html(`<span class="aura-thinking"><i></i><i></i><i></i></span>`);
			} else if (state === "error") {
				$content.addClass("is-error").text(content);
			} else if (state === "note") {
				$content.addClass("is-note").text(content);
			} else {
				aura.show_answer($content, content);
			}
		}

		aura.$ask.find(".aura-ask-messages").append($turn);
		aura.scroll_ask_to_bottom();
		return $turn;
	};

	aura.resize_ask_input = function () {
		if (!aura.$ask) return;
		const textarea = aura.$ask.find("textarea")[0];
		textarea.style.height = "auto";
		textarea.style.height = Math.min(textarea.scrollHeight, 140) + "px";
	};

	aura.scroll_ask_to_bottom = function () {
		const body = aura.$ask && aura.$ask.find(".aura-ask-body")[0];
		if (body) body.scrollTop = body.scrollHeight;
	};

	aura.new_ask_chat = function () {
		if (!aura.$ask || aura.ask_pending) return;
		aura.ask_history = [];
		aura.agent = null;
		aura.agent_state = null;
		aura.$ask.find(".aura-chat-turn, .aura-jumps").remove();
		aura.render_ask_welcome();
		aura.$ask.find("textarea").val("").trigger("input").trigger("focus");
	};

	aura.sync_ask_dock_layout = function () {
		if (!aura.$ask) return;
		const docked = aura.$ask.hasClass("is-open") && aura.$ask.hasClass("is-docked");
		document.body.classList.toggle("aura-ask-page-reflow", docked);
		aura.$ask.find(".aura-ask").attr("aria-modal", docked ? "false" : "true");
	};

	aura.open_ask = function () {
		if (!on(cfg().ai_bar)) return;
		const $a = aura.build_ask();
		$a.addClass("is-open");
		aura.sync_ask_dock_layout();
		setTimeout(() => $a.find("textarea").trigger("focus"), 20);
	};

	// Opens Ask Aura AI with a question already typed and sent: pages use it for guided "Ask AI" buttons.
	aura.ask_about = function (text) {
		if (!on(cfg().ai_bar)) {
			frappe.show_alert({ message: __("The AI assistant is turned off."), indicator: "orange" });
			return;
		}
		aura.open_ask();
		aura.agent = null;
		aura.agent_state = null;
		const $input = aura.$ask.find("textarea");
		$input.val(String(text || "")).trigger("input");
		aura.resize_ask_input();
		aura.submit_ask();
	};

	aura.toggle_ask_dock = function () {
		const docked = aura.$ask.toggleClass("is-docked").hasClass("is-docked");
		aura.$ask.find('[data-aura-ask-action="dock"]')
			.attr("aria-pressed", docked ? "true" : "false")
			.attr("title", __(docked ? "Undock" : "Dock to right"))
			.attr("aria-label", __(docked ? "Undock" : "Dock to right"));
		aura.sync_ask_dock_layout();
	};

	aura.toggle_ask_voice = function () {
		if (aura.ask_recognition) {
			aura.ask_recognition.stop();
			return;
		}
		const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!Recognition) {
			frappe.show_alert({ message: __("Voice input is not supported in this browser"), indicator: "orange" });
			return;
		}

		const recognition = new Recognition();
		const $voice = aura.$ask.find(".aura-ask-voice");
		const language = (frappe.boot && frappe.boot.lang) || document.documentElement.lang || "en";
		recognition.lang = language === "bn" ? "bn-BD" : language === "en" ? "en-US" : language;
		recognition.continuous = false;
		recognition.interimResults = false;
		recognition.onresult = (event) => {
			const transcript = Array.from(event.results)
				.filter((result) => result.isFinal)
				.map((result) => result[0].transcript)
				.join(" ")
				.trim();
			if (!transcript) return;
			const $textarea = aura.$ask.find("textarea");
			const current = $textarea.val().trim();
			$textarea.val(current ? current + " " + transcript : transcript).trigger("input");
			aura.resize_ask_input();
		};
		recognition.onerror = (event) => {
			if (event.error !== "aborted") {
				frappe.show_alert({
					message: event.error === "not-allowed" ? __("Microphone permission was denied") : __("Voice input failed"),
					indicator: "orange",
				});
			}
		};
		recognition.onend = () => {
			if (aura.ask_recognition === recognition) aura.ask_recognition = null;
			$voice.removeClass("is-listening").attr("aria-pressed", "false");
		};
		aura.ask_recognition = recognition;
		$voice.addClass("is-listening").attr("aria-pressed", "true");
		try {
			recognition.start();
		} catch (error) {
			aura.ask_recognition = null;
			$voice.removeClass("is-listening").attr("aria-pressed", "false");
			frappe.show_alert({
				message: __("Could not start voice input: {0}", [(error && error.message) || ""]),
				indicator: "orange",
			});
		}
	};

	aura.close_ask = function () {
		if (aura.ask_recognition) aura.ask_recognition.stop();
		if (aura.$ask) aura.$ask.removeClass("is-open");
		document.body.classList.remove("aura-ask-page-reflow");
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

	/* An answer as safe HTML: headings, bullet and numbered lists, tables, bold, code and [text](address) links. */
	aura.format_answer = function (text) {
		const safeUrl = (u) => /^\/(?!\/)/.test(u) || /^https:\/\//i.test(u);
		const inline = (raw) => {
			let t = esc(raw);
			t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
			t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
			t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, url) => {
				const plain = url.replace(/&amp;/g, "&").trim();
				return safeUrl(plain)
					? `<a class="aura-link" href="${esc(encodeURI(plain))}" target="_blank" rel="noopener noreferrer">${label}</a>`
					: label;
			});
			return t;
		};
		const lines = String(text || "").replace(/\r/g, "").split("\n");
		const out = [];
		let list = null;
		let para = [];
		const endList = () => { if (list) { out.push(`</${list}>`); list = null; } };
		const endPara = () => { if (para.length) { out.push(`<p>${para.join("<br>")}</p>`); para = []; } };
		const cells = (line) => line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
		const isRule = (r) => r.every((c) => /^:?-{2,}:?$/.test(c));
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (!line.trim()) { endList(); endPara(); continue; }
			if (/^\s*\|/.test(line)) {
				endList(); endPara();
				const rows = [];
				while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(cells(lines[i])); i++; }
				i--;
				const hasHead = rows.length > 1 && isRule(rows[1]);
				const body = rows.filter((r) => !isRule(r));
				const head = hasHead ? body.shift() : null;
				out.push(
					`<div class="aura-table-wrap"><table class="aura-table">${head ? `<thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead>` : ""}` +
						`<tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`,
				);
				continue;
			}
			if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { endList(); endPara(); out.push('<hr class="aura-rule">'); continue; }
			let m = line.match(/^\s*#{1,4}\s+(.*)$/);
			if (m) { endList(); endPara(); out.push(`<h4 class="aura-h">${inline(m[1])}</h4>`); continue; }
			m = line.match(/^\s*[-•*]\s+(.*)$/);
			if (m) { endPara(); if (list !== "ul") { endList(); out.push("<ul>"); list = "ul"; } out.push(`<li>${inline(m[1])}</li>`); continue; }
			m = line.match(/^\s*\d+[.)]\s+(.*)$/);
			if (m) { endPara(); if (list !== "ol") { endList(); out.push("<ol>"); list = "ol"; } out.push(`<li>${inline(m[1])}</li>`); continue; }
			endList();
			para.push(inline(line));
		}
		endList(); endPara();
		return out.join("");
	};

	/* Names of pages and reports in the ReckonERP guides, so an answer's menu names open the page in a new tab. */
	aura.link_rows = [];
	aura.link_regex = null;
	aura.load_links = function () {
		const route = frappe.get_route_str ? frappe.get_route_str() : "";
		return frappe
			.xcall("reckon_aura_theme.api.get_links", { route }, "GET")
			.then((rows) => {
				aura.link_rows = (rows || []).slice().sort((a, b) => b.label.length - a.label.length);
				const names = aura.link_rows.map((r) => r.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
				aura.link_regex = names.length ? new RegExp(`(?<![\\w/-])(${names.join("|")})(?![\\w-])`, "g") : null;
			})
			.catch(() => {});
	};
	aura.autolink = function ($root) {
		if (!aura.link_regex || !$root || !$root.length) return;
		const urlFor = {};
		aura.link_rows.forEach((r) => { urlFor[r.label] = r.url; });
		const seen = {};
		const walker = document.createTreeWalker($root[0], NodeFilter.SHOW_TEXT);
		const nodes = [];
		while (walker.nextNode()) nodes.push(walker.currentNode);
		nodes.forEach((node) => {
			if (node.parentElement.closest("a, pre")) return;
			const emphasised = !!node.parentElement.closest("strong, code, li, td, th, h4");
			const text = node.nodeValue;
			let last = 0;
			let changed = false;
			const frag = document.createDocumentFragment();
			text.replace(aura.link_regex, (label, _g, offset) => {
				const wordy = label.includes(" ") || label.length >= 10;
				if (!(emphasised || wordy) || (seen[label] || 0) >= 2) return label;
				seen[label] = (seen[label] || 0) + 1;
				frag.appendChild(document.createTextNode(text.slice(last, offset)));
				const a = document.createElement("a");
				a.className = "aura-link";
				a.href = encodeURI(urlFor[label]);
				a.target = "_blank";
				a.rel = "noopener noreferrer";
				a.textContent = label;
				frag.appendChild(a);
				last = offset + label.length;
				changed = true;
				return label;
			});
			if (changed) {
				frag.appendChild(document.createTextNode(text.slice(last)));
				node.parentNode.replaceChild(frag, node);
			}
		});
	};
	aura.show_answer = function ($content, answer) {
		$content.html(aura.format_answer(answer));
		aura.autolink($content);
	};

	// An agent is a registered assistant (an app's `aura_agents` hook) that asks questions in this chat and does the work.
	aura.agent = null;
	aura.agent_state = null;
	aura.start_agent = function (name, hidden_first_message) {
		if (!on(cfg().ai_bar)) {
			frappe.show_alert({ message: __("The AI assistant is turned off."), indicator: "orange" });
			return;
		}
		aura.open_ask();
		aura.new_ask_chat();
		aura.agent = name;
		aura.agent_state = null;
		aura.submit_ask(hidden_first_message || "start", true);
	};

	// Radio buttons for a single answer, checkboxes for several. Sending sends the chosen labels as the person's reply.
	aura.render_choices = function ($content, choices) {
		if (!choices || !choices.options || !choices.options.length) return;
		const multi = choices.type === "multi";
		const name = "aura-choice-" + Date.now();
		const $box = $(`<form class="aura-choices aura-quick-replies" role="${multi ? "group" : "radiogroup"}"></form>`).appendTo(
			$content.closest(".aura-chat-message")
		);
		choices.options.forEach((o, i) => {
			const $row = $(`<label class="aura-choice"><input type="${multi ? "checkbox" : "radio"}" name="${name}"><span></span></label>`).appendTo($box);
			$row.find("input").val(o.value).prop("checked", !!o.checked);
			$row.find("span").text(o.label);
		});
		const $go = $(`<button type="submit" class="aura-choice-go">${__("Continue")}</button>`).appendTo($box);
		const ready = () => $go.prop("disabled", !$box.find("input:checked").length);
		$box.on("change", "input", ready);
		ready();
		$box.on("submit", (e) => {
			e.preventDefault();
			const picked = $box.find("input:checked").map((_i, el) => el.value).get();
			if (!picked.length) return;
			$box.remove();
			aura.submit_ask(picked.join(", "));
		});
	};

	aura.render_quick_replies = function ($content, replies) {
		if (!replies || !replies.length) return;
		const $row = $(`<div class="aura-chips aura-quick-replies"></div>`).appendTo($content.closest(".aura-chat-message"));
		replies.forEach((label) => {
			// Not an `aura-chip`: those fill the box with their own text and send it, which would send the wrong thing here.
			$(`<button type="button" class="aura-qr"></button>`).text(label).appendTo($row).on("click", () => {
				$row.remove();
				aura.submit_ask(label);
			});
		});
	};

	aura.submit_ask = function (override, silent) {
		const $a = aura.$ask;
		if (aura.ask_pending) return;
		const $input = $a.find("textarea");
		const q = (typeof override === "string" ? override : $input.val() || "").trim();
		if (!q) return;
		$a.find(".aura-ask-welcome, .aura-jumps, .aura-quick-replies").remove();
		if (!silent) aura.render_ask_message("user", q);
		const agent = aura.agent;
		if (!agent && !cfg().ai_ready) {
			$input.val(q);
			aura.resize_ask_input();
			aura.render_jumps(q);
			aura.render_ask_message(
				"assistant",
				__("AI answers are not set up yet. A System Manager can add a model and API key in Reckon Aura AI settings (Aura Theme Settings)."),
				"note"
			);
			return;
		}
		if (typeof override !== "string") $input.val("").trigger("input");
		aura.resize_ask_input();
		const history = aura.ask_history.slice(-12);
		const $answer = aura.render_ask_message("assistant", "", "pending");
		aura.ask_pending = true;
		$a.find('[data-aura-ask-action="send"], [data-aura-ask-action="new-chat"]').prop("disabled", true);
		frappe
			// Agent turns are many and short and use no AI, so they have their own endpoint and a higher rate limit.
			.xcall(agent ? "reckon_aura_theme.api.ask_agent" : "reckon_aura_theme.api.ask", {
				question: q,
				route: frappe.get_route_str ? frappe.get_route_str() : "",
				history: JSON.stringify(history),
				agent: agent || "",
				agent_state: agent ? JSON.stringify(aura.agent_state || null) : "",
			})
			.then((r) => {
				const answer = (r && r.answer) || __("No answer.");
				aura.show_answer($answer.find(".aura-chat-content"), answer);
				// An answer that names an agent (even to a plain question) keeps the chat with it until it is done.
				if (agent || (r && Object.prototype.hasOwnProperty.call(r, "agent"))) {
					aura.agent = (r && r.agent) || null;
					aura.agent_state = (r && r.agent_state) || null;
					aura.render_choices($answer.find(".aura-chat-content"), r && r.choices);
					aura.render_quick_replies($answer.find(".aura-chat-content"), r && r.replies);
				}
				aura.ask_history = aura.ask_history.concat(
					{ role: "user", content: q },
					{ role: "assistant", content: answer }
				).slice(-12);
				aura.scroll_ask_to_bottom();
				aura.ask_pending = false;
				$a.find('[data-aura-ask-action="send"], [data-aura-ask-action="new-chat"]').prop("disabled", false);
			})
			.catch((e) => {
				$answer.find(".aura-chat-content").addClass("is-error").text(
					__("Could not get an answer. {0}", [(e && e.message) || ""])
				);
				aura.scroll_ask_to_bottom();
				aura.ask_pending = false;
				$a.find('[data-aura-ask-action="send"], [data-aura-ask-action="new-chat"]').prop("disabled", false);
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
		aura.fill_policy().then((policy) => {
			if (!policy.enabled || frm.doc.docstatus !== 0) return;
			const $btn = frm.add_custom_button("✦ " + __("Fill with AI"), () => aura.fill_dialog(frm, policy));
			$btn && $btn.addClass && $btn.addClass("aura-fill-btn");
		}).catch(() => {});  // not allowed or not set up: no button
	};

	// Asked once per page load: the plan's switch and how many uses are left today.
	aura.fill_policy = function () {
		if (!aura._fill_policy) aura._fill_policy = frappe.xcall("reckon_aura_theme.api.fill_policy");
		return aura._fill_policy;
	};

	// A photo is shrunk first (1600 px, JPEG): a phone picture is several MB and the AI reads the smaller one as well.
	aura.read_fill_file = function (file, maxMb) {
		return new Promise((resolve, reject) => {
			if (!file) return resolve(null);
			const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
			const isImage = /^image\//.test(file.type);
			if (!isPdf && !isImage) return reject(new Error(__("Upload a photo (JPG, PNG, WebP) or a PDF.")));
			const reader = new FileReader();
			reader.onerror = () => reject(new Error(__("The file could not be read.")));
			reader.onload = () => {
				if (isPdf) {
					if (file.size > maxMb * 1024 * 1024) return reject(new Error(__("The file is too large. The limit is {0} MB.", [maxMb])));
					return resolve({ name: file.name, data: reader.result });
				}
				const img = new Image();
				img.onerror = () => reject(new Error(__("The photo could not be read.")));
				img.onload = () => {
					const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
					const canvas = document.createElement("canvas");
					canvas.width = Math.round(img.width * scale);
					canvas.height = Math.round(img.height * scale);
					canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
					resolve({ name: file.name, data: canvas.toDataURL("image/jpeg", 0.85) });
				};
				img.src = reader.result;
			};
			reader.readAsDataURL(file);
		});
	};

	aura.fill_dialog = function (frm, policy) {
		policy = policy || {};
		let attached = null;
		let recognition = null;
		const d = new frappe.ui.Dialog({
			title: "✦ " + __("Fill with AI"),
			size: "large",
			fields: [
				{
					fieldtype: "HTML",
					fieldname: "hint",
					options: `<p class="text-muted" style="margin-bottom:8px">${__(
						"Paste a purchase order, an email or rough notes, speak it, or upload a photo or PDF. AI finds the party, items, quantities and rates, matches them to your masters, and fills this {0}. Nothing is saved until you click Save.",
						[__(frm.doctype)]
					)}</p>
					<div class="aura-fill-tools" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
						<button type="button" class="btn btn-default btn-sm aura-fill-voice">🎤 ${__("Speak")}</button>
						<select class="form-control input-sm aura-fill-lang" style="width:auto"><option value="en-US">English</option><option value="bn-BD">বাংলা</option></select>
						<button type="button" class="btn btn-default btn-sm aura-fill-attach">📎 ${__("Photo or PDF")}</button>
						<input type="file" class="aura-fill-file" accept="image/*,application/pdf" hidden>
						<span class="text-muted small aura-fill-file-name"></span>
					</div>
					${policy.daily_limit ? `<p class="text-muted small" style="margin:0 0 6px">${__("{0} of {1} uses left today.", [policy.left == null ? policy.daily_limit : policy.left, policy.daily_limit])}</p>` : ""}`,
				},
				{ fieldtype: "Small Text", fieldname: "source", label: __("Source text") },
				{
					fieldtype: "Check",
					fieldname: "replace_items",
					label: __("Replace existing item rows"),
					default: 1,
				},
			],
			primary_action_label: __("Fill form"),
			primary_action: (values) => {
				if (!(values.source || "").trim() && !attached) {
					frappe.show_alert({ message: __("Paste some text, speak, or upload a photo or PDF first."), indicator: "orange" });
					return;
				}
				const $p = d.get_primary_btn();
				$p.prop("disabled", true).text(__("Reading…"));
				frappe
					.xcall("reckon_aura_theme.api.extract_document", {
						doctype: frm.doctype,
						text: values.source || "",
						file_data: attached ? attached.data : null,
					})
					.then((r) => { aura._fill_policy = null; return aura.confirm_missing(frm, r, policy); })
					.then((r) => aura.apply_extraction(frm, r, values.replace_items))
					.then(() => d.hide())
					.catch(() => $p.prop("disabled", false).text(__("Fill form")));
			},
		});
		d.$wrapper.addClass("aura-fill-dialog");
		d.onhide = () => { try { recognition && recognition.stop(); } catch (e) { /* already stopped */ } };

		// Voice: dictate into the text box (browser speech recognition; Chrome and Edge).
		const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		const $voice = d.$wrapper.find(".aura-fill-voice");
		if (!Recognition) {
			$voice.prop("disabled", true).attr("title", __("Voice input is not supported in this browser"));
			d.$wrapper.find(".aura-fill-lang").hide();
		} else {
			const lang = (frappe.boot && frappe.boot.lang) === "bn" ? "bn-BD" : "en-US";
			d.$wrapper.find(".aura-fill-lang").val(lang);
			$voice.on("click", () => {
				if (recognition) { recognition.stop(); return; }
				recognition = new Recognition();
				recognition.lang = d.$wrapper.find(".aura-fill-lang").val();
				recognition.continuous = true;
				recognition.interimResults = false;
				recognition.onresult = (event) => {
					let heard = "";
					for (let i = event.resultIndex; i < event.results.length; i++) heard += event.results[i][0].transcript + " ";
					const field = d.get_field("source");
					field.set_value(((field.get_value() || "") + " " + heard).trim());
				};
				recognition.onend = () => { recognition = null; $voice.text("🎤 " + __("Speak")); };
				recognition.onerror = () => { recognition = null; $voice.text("🎤 " + __("Speak")); };
				$voice.text("⏹ " + __("Stop"));
				recognition.start();
			});
		}

		// A photo or PDF.
		const $file = d.$wrapper.find(".aura-fill-file");
		d.$wrapper.find(".aura-fill-attach").on("click", () => $file.trigger("click"));
		$file.on("change", () => {
			const file = $file[0].files[0];
			aura.read_fill_file(file, policy.max_file_mb || 5)
				.then((result) => {
					attached = result;
					d.$wrapper.find(".aura-fill-file-name").text(result ? "📎 " + result.name : "");
				})
				.catch((error) => {
					attached = null;
					$file.val("");
					d.$wrapper.find(".aura-fill-file-name").text("");
					frappe.show_alert({ message: error.message, indicator: "red" });
				});
		});
		d.show();
	};

	// Customers, suppliers and items the AI found but you do not have yet: the user decides which to create.
	aura.confirm_missing = function (frm, r, policy) {
		const party = r.missing_party, items = r.missing_items || [];
		if (!policy.create || (!party && !items.length)) return Promise.resolve(r);
		return new Promise((resolve) => {
			const fields = [{
				fieldtype: "HTML",
				options: `<p class="text-muted">${__("These are not in your records yet. Tick what to create; each is made with default settings and marked for review. You can rename them first.")}</p>`,
			}];
			if (party) {
				fields.push({ fieldtype: "Check", fieldname: "make_party", label: __("Create {0}", [__(r.party_type)]), default: 1 });
				fields.push({ fieldtype: "Data", fieldname: "party_name", label: __(r.party_type) + " " + __("Name"), default: party, depends_on: "make_party" });
			}
			items.forEach((row, i) => {
				fields.push({ fieldtype: "Check", fieldname: `make_${i}`, label: __("Create item"), default: 1 });
				fields.push({ fieldtype: "Data", fieldname: `name_${i}`, label: __("Item") + ` ${i + 1}` + (row.qty ? ` (${__("Qty")} ${row.qty}${row.uom ? " " + row.uom : ""})` : ""), default: row.name, depends_on: `make_${i}` });
			});
			let done = false;
			const finish = (value) => { if (!done) { done = true; resolve(value); } };
			const dialog = new frappe.ui.Dialog({
				title: "✦ " + __("Create what is missing?"),
				fields,
				primary_action_label: __("Create and fill"),
				primary_action: (v) => {
					const chosen = items.map((row, i) => ({ ...row, name: (v[`name_${i}`] || "").trim(), make: v[`make_${i}`] })).filter((row) => row.make && row.name);
					const partyName = party && v.make_party ? (v.party_name || "").trim() : "";
					if (!partyName && !chosen.length) { dialog.hide(); return; }
					dialog.get_primary_btn().prop("disabled", true).text(__("Creating…"));
					frappe.xcall("reckon_aura_theme.api.create_missing", { doctype: frm.doctype, party: partyName, items: JSON.stringify(chosen) })
						.then((made) => {
							const merged = Object.assign({}, r);
							if (made.party) { merged.party = made.party; merged.missing_party = null; }
							merged.items = (r.items || []).concat(made.items || []);
							finish(merged);
							dialog.hide();
						})
						.catch(() => dialog.get_primary_btn().prop("disabled", false).text(__("Create and fill")));
				},
				secondary_action_label: __("Fill without creating"),
				secondary_action: () => { finish(r); dialog.hide(); },
			});
			dialog.onhide = () => finish(r);
			dialog.show();
		});
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

	// Every custom page of the Reckon apps sits in one white container (see .rk-page in the stylesheet).
	aura.mark_pages = function () {
		const names = new Set((frappe.boot && frappe.boot.reckon_pages) || []);
		$(".page-container[data-page-route]").each((_, el) => $(el).toggleClass("rk-page", names.has(el.dataset.pageRoute)));
	};

	const on_route = frappe.utils.debounce(() => {
		aura.mark_pages();
		aura.mount_tools();
		aura.mount_collapse();
		aura.render_brief();
	}, 150);

	aura.init = function () {
		if (aura._ready) return;
		aura._ready = true;
		if (!aura.apply()) return;
		aura.mount_tools();
		aura.mount_collapse();
		if (frappe.router && typeof frappe.router.on === "function") frappe.router.on("change", on_route);
		$(document).on("page-change", on_route);
		on_route();
	};

	aura.apply(); // as early as possible to avoid a flash of wrong accent
	$(document).on("app_ready", aura.init);
	$(() => frappe.boot && frappe.boot.user && setTimeout(aura.init, 0));
})();
