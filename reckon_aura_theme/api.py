"""Server side of Reckon Aura Theme: public config, the workspace brief,
the Ask-AI command bar and Fill-with-AI document extraction.

Every data read goes through frappe.get_list, so users only ever see
(and the AI only ever receives) records they are already permitted to read.
"""

import json
import re

import frappe
import requests
from frappe import _
from frappe.rate_limiter import rate_limit
from frappe.utils import add_days, add_months, cint, flt, fmt_money, get_first_day, getdate, nowdate

SETTINGS = "Aura Theme Settings"

PARTY_FIELDS = {
	"Sales Invoice": ("Customer", "customer"),
	"Sales Order": ("Customer", "customer"),
	"Delivery Note": ("Customer", "customer"),
	"Quotation": ("Customer", "party_name"),
	"Purchase Order": ("Supplier", "supplier"),
	"Purchase Invoice": ("Supplier", "supplier"),
	"Purchase Receipt": ("Supplier", "supplier"),
}

DEFAULT_PROMPT = (
	"You are the assistant inside an ERPNext (Frappe) desk. Answer briefly and concretely, "
	"using only the facts in the provided context. If the context does not contain the answer, "
	"say so and suggest where in ERPNext the user can find it (DocType or report name). "
	"Use the company currency. Prefer short bullet points. Never invent figures."
)

EXTRACT_PROMPT = (
	"Extract a {party_type} transaction from the user's text (a purchase order, email or notes). "
	"Reply with ONLY a JSON object, no prose, shaped exactly like: "
	'{{"party": "<{party_type} name or null>", "due_date": "YYYY-MM-DD or null", '
	'"delivery_date": "YYYY-MM-DD or null", "items": [{{"item": "<item code or name>", '
	'"qty": <number>, "rate": <number or null>}}]}}'
)


# ---------------------------------------------------------------- config


class AuraAIError(Exception):
	"""AI call failed. Raised instead of frappe.throw when the caller wants no user-facing message."""


def _settings():
	return frappe.get_cached_doc(SETTINGS)


def _require_desk_user():
	"""AI endpoints are for desk (System) users only, not portal / website users."""
	user = frappe.session.user
	if user == "Guest" or frappe.get_cached_value("User", user, "user_type") != "System User":
		frappe.throw(_("Not permitted"), frappe.PermissionError)


def _like(text):
	"""Escape LIKE wildcards in user / AI supplied text."""
	return "%" + str(text).replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%"


def _api_key(s):
	try:
		return s.get_password("ai_api_key", raise_exception=False)
	except Exception:
		return None


def _ai_ready(s):
	return bool(s.ai_model and _api_key(s))


def get_public_config():
	s = _settings()
	return {
		"enabled": cint(s.enable_theme),
		"brand_name": s.brand_name or "",
		"brand_logo": s.brand_logo or "",
		"accent": (s.accent or "Violet").lower(),
		"custom_accent": s.custom_accent or "",
		"custom_accent_2": s.custom_accent_2 or "",
		"density": (s.density or "Comfortable").lower(),
		"glass_blur": cint(s.glass_blur) if s.glass_blur is not None else 18,
		"aurora_background": cint(s.aurora_background),
		"allow_user_override": cint(s.allow_user_override),
		"ai_bar": cint(s.enable_ai_bar),
		"ai_brief": cint(s.enable_ai_brief),
		"ai_fill": cint(s.enable_ai_fill),
		"ai_ready": _ai_ready(s),
	}


@frappe.whitelist(allow_guest=True)
def get_login_config():
	try:
		s = _settings()
	except Exception:
		return {"enabled": 1}
	return {
		"enabled": cint(s.enable_theme),
		"brand_name": s.brand_name or "ERPNext",
		"brand_logo": s.brand_logo or "",
		"accent": (s.accent or "Violet").lower(),
		"custom_accent": s.custom_accent or "",
		"custom_accent_2": s.custom_accent_2 or "",
		"headline": s.login_headline or "",
		"tagline": s.login_tagline or "",
		"footer": s.login_footer or "",
	}


# ---------------------------------------------------------------- brief


def _cache():
	return frappe.cache() if callable(frappe.cache) else frappe.cache


def _can(doctype):
	return frappe.db.exists("DocType", doctype) and frappe.has_permission(doctype, "read")


def _rows(doctype, filters, fields, order_by=None, limit=0):
	# limit=0 → no limit, so counts and totals are never silently truncated.
	return frappe.get_list(
		doctype, filters=filters, fields=fields, order_by=order_by or "creation desc", limit_page_length=limit
	)


def _sum(doctype, filters, field):
	rows = _rows(doctype, filters, [field])
	return sum(flt(r.get(field)) for r in rows)


def _overdue_filters(scope, today):
	return {**scope, "docstatus": 1, "outstanding_amount": [">", 0], "due_date": ["<", str(today)]}


def _due_soon_filters(scope, today):
	return {
		**scope,
		"docstatus": 1,
		"outstanding_amount": [">", 0],
		"due_date": ["between", [str(today), str(add_days(today, 7))]],
	}


def _company_currency():
	company = frappe.defaults.get_user_default("Company")
	if company:
		return company, frappe.get_cached_value("Company", company, "default_currency")
	return None, frappe.db.get_default("currency")


def _money(value, currency):
	return fmt_money(value, currency=currency, precision=0)


def _build_brief():
	today = getdate(nowdate())
	company, currency = _company_currency()
	scope = {"company": company} if company else {}
	insights = []

	if _can("Sales Invoice"):
		overdue = _rows(
			"Sales Invoice",
			_overdue_filters(scope, today),
			["name", "customer_name", "outstanding_amount", "due_date"],
			order_by="outstanding_amount desc",
		)
		if overdue:
			top = overdue[0]
			total = sum(flt(d.outstanding_amount) for d in overdue)
			insights.append(
				{
					"tone": "warn",
					"text": _("{0} overdue invoices worth {1}. {2} is the largest, {3} days late.").format(
						len(overdue),
						_money(total, currency),
						top.customer_name,
						(today - getdate(top.due_date)).days,
					),
					"cta": _("Review overdue"),
					"route": ["List", "Sales Invoice", _overdue_filters(scope, today)],
				}
			)

		first = get_first_day(today)
		this_period = _sum(
			"Sales Invoice",
			{**scope, "docstatus": 1, "posting_date": ["between", [first, today]]},
			"base_grand_total",
		)
		last_period = _sum(
			"Sales Invoice",
			{
				**scope,
				"docstatus": 1,
				"posting_date": ["between", [add_months(first, -1), add_months(today, -1)]],
			},
			"base_grand_total",
		)
		if this_period or last_period:
			if last_period:
				delta = round((this_period / last_period - 1) * 100)
				trend = _("up {0}%").format(delta) if delta >= 0 else _("down {0}%").format(abs(delta))
				text = _("Billed {0} so far this month — {1} on the same days last month.").format(
					_money(this_period, currency), trend
				)
			else:
				text = _("Billed {0} so far this month.").format(_money(this_period, currency))
			insights.append(
				{
					"tone": "info",
					"text": text,
					"cta": _("Open report"),
					"route": ["query-report", "Sales Register"],
				}
			)

		drafts = _rows("Sales Invoice", {**scope, "docstatus": 0}, ["name"])
		if drafts:
			insights.append(
				{
					"tone": "info",
					"text": _("{0} draft sales invoice(s) waiting to be submitted.").format(len(drafts)),
					"cta": _("Review drafts"),
					"route": ["List", "Sales Invoice", {"docstatus": 0}],
				}
			)

	if _can("Purchase Invoice"):
		due = _rows(
			"Purchase Invoice",
			_due_soon_filters(scope, today),
			["name", "outstanding_amount"],
		)
		if due:
			insights.append(
				{
					"tone": "info",
					"text": _("{0} supplier bills worth {1} fall due in the next 7 days.").format(
						len(due), _money(sum(flt(d.outstanding_amount) for d in due), currency)
					),
					"cta": _("Plan payments"),
					"route": ["List", "Purchase Invoice", _due_soon_filters(scope, today)],
				}
			)

	if not insights and _can("ToDo"):
		todos = _rows("ToDo", {"allocated_to": frappe.session.user, "status": "Open"}, ["name"])
		insights.append(
			{
				"tone": "ok",
				"text": _("You have {0} open to-do(s).").format(len(todos))
				if todos
				else _("All clear — nothing needs you right now."),
				"cta": _("Open to-dos"),
				"route": ["List", "ToDo", {"allocated_to": frappe.session.user, "status": "Open"}],
			}
		)

	return insights[:4]


@frappe.whitelist()
def get_brief(refresh=0):
	_require_desk_user()
	key = f"aura_brief::{frappe.session.user}"
	cache = _cache()
	if not cint(refresh):
		cached = cache.get_value(key)
		if cached:
			return cached

	insights = _build_brief()
	headline = None
	s = _settings()
	if _ai_ready(s) and insights:
		# The headline is optional: a failing provider must not pop an error on every workspace.
		try:
			headline = _complete(
				s,
				"Write ONE short sentence (max 22 words) telling a busy finance user what matters most today. "
				"Use only these facts. No preamble.",
				"\n".join(i["text"] for i in insights),
				max_tokens=80,
				quiet=True,
			).strip()
		except AuraAIError:
			headline = None

	result = {"headline": headline, "insights": insights, "ai": bool(headline), "generated_at": nowdate()}
	cache.set_value(key, result, expires_in_sec=900)
	return result


# ---------------------------------------------------------------- AI calls


def _require_ai(s):
	if not _ai_ready(s):
		frappe.throw(
			_("AI is not configured. Add a model and API key in {0}.").format(
				'<a href="/desk/aura-theme-settings">Aura Theme Settings</a>'
			),
			title=_("AI not configured"),
		)


def _post(url, headers, payload):
	r = requests.post(url, headers=headers, json=payload, timeout=60)
	r.raise_for_status()
	return r.json()


def _complete(s, system, user, max_tokens=700, quiet=False):
	"""Call the configured provider. Errors are logged; with quiet=True they raise
	AuraAIError (no message reaches the user), otherwise a user-facing frappe.throw."""
	key = _api_key(s)
	provider = s.ai_provider or "OpenAI Compatible"
	try:
		if provider == "Anthropic":
			base = s.ai_base_url or "https://api.anthropic.com"
			data = _post(
				f"{base}/v1/messages",
				{"x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json"},
				{
					"model": s.ai_model,
					"max_tokens": max_tokens,
					"system": system,
					"messages": [{"role": "user", "content": user}],
				},
			)
			return "".join(b.get("text", "") for b in data.get("content", []) if b.get("type") == "text")

		base = s.ai_base_url or "https://api.openai.com/v1"
		data = _post(
			f"{base}/chat/completions",
			{"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
			{
				"model": s.ai_model,
				"max_tokens": max_tokens,
				"temperature": 0.2,
				"messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
			},
		)
		return data["choices"][0]["message"]["content"] or ""
	except requests.HTTPError as e:
		status = getattr(e.response, "status_code", "?")
		frappe.log_error(f"{e}\n\n{getattr(e.response, 'text', '')[:2000]}", "Aura AI request failed")
		message = _("The AI provider returned an error ({0}). Check the model and API key.").format(status)
	except requests.RequestException as e:
		frappe.log_error(str(e), "Aura AI request failed")
		message = _("Could not reach the AI provider. Check the Base URL and network.")
	except (ValueError, KeyError, IndexError, TypeError, AttributeError) as e:
		frappe.log_error(f"Unexpected response shape: {e!r}", "Aura AI request failed")
		message = _("The AI provider sent a reply that could not be read. Check the Base URL and model.")

	if quiet:
		raise AuraAIError(message)
	frappe.throw(message)


def _ask_records():
	"""Top records behind the brief, so the assistant can name invoices and parties."""
	today = getdate(nowdate())
	company, _currency = _company_currency()
	scope = {"company": company} if company else {}
	records = {}
	if _can("Sales Invoice"):
		records["overdue_sales_invoices"] = _rows(
			"Sales Invoice",
			_overdue_filters(scope, today),
			["name", "customer_name", "outstanding_amount", "due_date"],
			order_by="outstanding_amount desc",
			limit=10,
		)
	if _can("Purchase Invoice"):
		records["supplier_bills_due_7_days"] = _rows(
			"Purchase Invoice",
			_due_soon_filters(scope, today),
			["name", "supplier_name", "outstanding_amount", "due_date"],
			order_by="due_date asc",
			limit=10,
		)
	return records


@frappe.whitelist(methods=["POST"])
@rate_limit(limit=40, seconds=60 * 60)
def ask(question, route=None):
	_require_desk_user()
	question = (question or "").strip()[:2000]
	if not question:
		frappe.throw(_("Type a question first."))
	s = _settings()
	if not cint(s.enable_ai_bar):
		frappe.throw(_("The AI assistant is turned off."))
	_require_ai(s)

	company, currency = _company_currency()
	context = {
		"today": nowdate(),
		"user": frappe.utils.get_fullname(frappe.session.user),
		"company": company,
		"currency": currency,
		"current_page": str(route or "")[:200],
		"facts": [i["text"] for i in _build_brief()],
		"records": _ask_records(),
	}
	answer = _complete(
		s,
		s.ai_system_prompt or DEFAULT_PROMPT,
		f"Context (JSON):\n{json.dumps(context, default=str)}\n\nQuestion: {question}",
	)
	return {"answer": answer.strip()}


@frappe.whitelist()
def test_connection():
	frappe.only_for("System Manager")
	s = _settings()
	_require_ai(s)
	return _complete(s, "Reply with exactly: Aura is connected.", "ping", max_tokens=20)


# ---------------------------------------------------------------- Fill with AI


def _parse_json(raw):
	raw = re.sub(r"^```(?:json)?|```$", "", (raw or "").strip(), flags=re.M).strip()
	start, end = raw.find("{"), raw.rfind("}")
	data = None
	if start != -1 and end > start:
		try:
			data = json.loads(raw[start : end + 1])
		except ValueError:
			data = None
	if not isinstance(data, dict):
		frappe.throw(_("The AI reply could not be read. Try again with clearer text."))
	return data


def _date(value):
	try:
		return str(getdate(value)) if value else None
	except Exception:
		return None


def _match_party(party_type, name):
	if not name:
		return None
	name = str(name).strip()[:140]
	exact = frappe.get_list(party_type, filters={"name": name}, pluck="name", limit=1)
	if exact:
		return exact[0]
	label = "customer_name" if party_type == "Customer" else "supplier_name"
	hit = frappe.get_list(
		party_type, filters={label: ["like", _like(name)], "disabled": 0}, pluck="name", limit=1
	)
	return hit[0] if hit else None


def _match_item(text, party_type):
	if not text:
		return None
	text = str(text).strip()[:140]
	filters = {"disabled": 0, "is_sales_item" if party_type == "Customer" else "is_purchase_item": 1}
	exact = frappe.get_list("Item", filters={**filters, "name": text}, pluck="name", limit=1)
	if exact:
		return exact[0]
	hit = frappe.get_list(
		"Item",
		filters=filters,
		or_filters={"item_code": ["like", _like(text)], "item_name": ["like", _like(text)]},
		pluck="name",
		limit=1,
	)
	return hit[0] if hit else None


@frappe.whitelist(methods=["POST"])
@rate_limit(limit=60, seconds=60 * 60)
def extract_document(doctype, text):
	_require_desk_user()
	if doctype not in PARTY_FIELDS:
		frappe.throw(_("Fill with AI is not available for {0}.").format(doctype))
	frappe.has_permission(doctype, "create", throw=True)
	s = _settings()
	if not cint(s.enable_ai_fill):
		frappe.throw(_("Fill with AI is turned off."))
	_require_ai(s)

	party_type, _field = PARTY_FIELDS[doctype]
	data = _parse_json(
		_complete(s, EXTRACT_PROMPT.format(party_type=party_type), (text or "")[:12000], max_tokens=1500)
	)

	rows = data.get("items")
	items, unmatched = [], []
	for row in (rows if isinstance(rows, list) else [])[:100]:
		if not isinstance(row, dict):
			continue
		label = row.get("item") or row.get("description")
		code = _match_item(label, party_type)
		if code:
			items.append(
				{"item_code": code, "qty": flt(row.get("qty")) or 1, "rate": flt(row.get("rate")) or None}
			)
		elif label:
			unmatched.append(str(label)[:80])

	party = data.get("party")
	return {
		"party_type": party_type,
		"party": _match_party(party_type, party),
		"party_text": str(party)[:140] if party else None,
		"due_date": _date(data.get("due_date")),
		"delivery_date": _date(data.get("delivery_date")),
		"items": items,
		"unmatched": unmatched,
	}
