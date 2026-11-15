# Ask AI ERP Support Skills Plan

Status: Accounts milestone shipped; the approved module-guide expansion is implemented locally. Frappe integration tests and a product-specific custom-app guide remain pending.

## Agreed decisions

- First skill: Accounts only.
- Initial coverage: Chart of Accounts, Sales Invoice, Payment Entry, Bank
  Reconciliation, General Ledger, and financial reports.
- Source priority: official ERPNext documentation defines standard behavior;
  Reckon Accounts documentation adds product-specific details and does not
  override standard ERPNext behavior.
- Language: answer in the language used by the user. For Bangla, respond in
  Bangla script while retaining useful English ERPNext menu and field names.
- Branding: use **ReckonERP** and **Powered by Frappe** across theme surfaces.
- The assistant is guidance-only in this milestone; it does not perform
  accounting actions or assume custom apps are installed.

## Implementation

1. Add a concise, source-linked `accounts_skills.md` in the Frappe app package.
2. Select the Accounts guide from recognized Accounts routes or English/Bangla
   accounting question terms; never use the client route to grant access.
3. Pass the guide alongside the existing permission-limited facts and records.
4. Preserve admin instructions while adding language, source-priority, and
   site-configuration caveats to the AI prompt.
5. Update theme branding defaults and documentation without renaming internal
   Frappe module or Python package identifiers.
6. Add focused tests for skill selection, Bangla/accounting intent, prompt
   behavior, and guide loading; run the smallest available validation suite.

## Validation

- Python syntax compilation passed for the changed Python files.
- JavaScript syntax check passed for the login bundle.
- Built a wheel and verified that `skills/accounts_skills.md` is included.
- Isolated routing/context checks passed for Accounts routes, Bangla intent,
  admin prompt retention, and unrelated-question fallback.
- `git diff --check` passed.
- Frappe integration tests could not run because Frappe and `bench` are not
  installed in this environment.

## Acceptance criteria

- Accounts questions from supported routes or recognized question terms get
  the Accounts guide; unrelated questions do not.
- The model is instructed to answer in the user's language, including Bangla,
  and distinguish standard ERPNext from Reckon Accounts-specific behavior.
- Missing/oversized guidance is surfaced explicitly rather than silently
  returning an ungrounded answer.
- Existing live-data permissions and non-Accounts Ask AI behavior remain
  unchanged.
- Visible default branding reads ReckonERP / Powered by Frappe; customized
  administrator login text is preserved.

## References

- [ERPNext Accounting Introduction](https://docs.frappe.io/erpnext/accounting-introduction)
- [ERPNext Accounting Reports](https://docs.frappe.io/erpnext/accounting-reports)
- [Reckon Accounts README](https://github.com/TechwithZakir/Reckon-Accounts/blob/main/README.md)
- [Reckon Accounts report catalog](https://github.com/TechwithZakir/Reckon-Accounts/blob/main/REPORT_CATALOG.md)

## Approved module expansion

The user approved support guides for Selling/Sales, Buying/Procurement,
Stock/Inventory, HR/Payroll, Manufacturing, CRM/Projects, and custom modules.
Each guide lives in its own `skills/{module}_skills.md` file and is selected
from the current Desk route and question. When a question clearly spans two
areas, attach at most two relevant guides.

- Use official ERPNext documentation for standard ERPNext behavior.
- Identify Frappe HR and Frappe CRM as separate apps; do not imply either is
  installed on every site.
- The generic custom-module guide must ask for the exact app/page and sources
  rather than inventing custom workflows. A product-specific custom guide
  needs the app name and authoritative documentation.
- Preserve language matching, permission boundaries, configuration caveats,
  and advisory-only behavior for every guide.

The current implementation has separate guides for Selling, Buying, Stock,
HR, Manufacturing, CRM/Projects, and safe custom-module discovery. The exact
custom app name and its documentation are still needed before adding
product-specific custom behavior.

## Expansion acceptance criteria

- Each approved module has a source-linked guide with setup, normal workflow,
  common troubleshooting steps, and configuration/permission caveats.
- Route matching selects the page's module; question matching covers common
  English and Bangla terms without attaching unrelated guides.
- No more than two guides are included per Ask AI request.
- Missing, unreadable, or oversized guides fail explicitly rather than
  silently falling back to an ungrounded answer.
- Tests cover module routing, Bangla intent, two-guide selection, and unrelated
  question fallback.
