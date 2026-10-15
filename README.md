# Reckon Aura Theme

**Aurora Glass** — an AI-first desk theme for **Frappe / ERPNext v16+**.reckon_aura_theme
Frosted-glass surfaces over a violet → cyan aurora, Sora headings over Geist, dark-first with a full light mode, and AI built into the layout.

## What you get

| Area | Details |
| --- | --- |
| Desk skin | Remaps Frappe's design tokens (`--primary`, `--bg-color`, `--card-bg`, `--border-color`, `--control-bg`, radii, shadows, datatable vars) and skins navbar, sidebar, page head, workspaces & widgets, list, report (datatable), kanban, form, child tables, timeline, dialogs, dropdowns, alerts |
| Modes | Follows Frappe's own light / dark (`data-theme`) and persists the toggle on the User via `switch_theme` |
| Accents | Violet, Cyan, Ember or a Custom pair — site default plus optional per-browser override from the navbar |
| Density | Comfortable / Compact, site default + per-browser toggle |
| Ask AI | `Ctrl/⌘ + J` command panel. Answers questions using the brief facts plus the top overdue sales invoices and supplier bills due this week (only records you can read); also an offline "jump to" palette over the DocTypes you can read |
| Brief | A "Today's brief" card on workspaces: overdue receivables, month-to-date billing vs last month, draft invoices, supplier bills due in 7 days (optionally summarised by AI). Dismissible per session |
| Fill with AI | On Sales Invoice / Order, Quotation, Delivery Note, Purchase Order / Invoice / Receipt drafts: paste a PO or email, AI extracts party + items + qty + rate and matches them to your masters. Nothing is saved automatically |
| Login | Aurora login with a brand hero (headline / tagline / footer from settings). Only auth pages are styled — your website keeps its Website Theme |

<img width="1888" height="982" alt="image" src="https://github.com/user-attachments/assets/3a754677-3b4e-488a-96cb-a0f562f4fb6b" />
<img width="1901" height="968" alt="image" src="https://github.com/user-attachments/assets/9fbb6adf-28ee-49f6-b4a8-413165f27ac1" />
<img width="1688" height="938" alt="image" src="https://github.com/user-attachments/assets/2f2c954f-9c73-474c-aca3-0b50c9bd61fb" />
<img width="1898" height="974" alt="image" src="https://github.com/user-attachments/assets/b28cea25-4de5-4558-960c-99bf94aa4428" />

<img width="1393" height="966" alt="image" src="https://github.com/user-attachments/assets/c98b171e-f6bf-496c-bc69-2622039e4934" />

## Install

```bash
cd frappe-bench
bench get-app https://github.com/TechwithZakir/reckon_aura_theme
bench --site your.site install-app reckon_aura_theme
bench build --app reckon_aura_theme
bench --site your.site clear-cache
```

Then open **Aura Theme Settings** (`/desk/aura-theme-settings`).

## Configure AI (optional)

The theme works fully without AI — the brief is computed from your data, and the command panel falls back to page search.

1. **Aura Theme Settings → AI**
2. Provider: **OpenAI Compatible** (OpenAI, Azure OpenAI, Groq, Together, Ollama, vLLM, LM Studio…) or **Anthropic**
3. Base URL (optional), Model, API Key
4. Click **Test AI connection**

Privacy: all data reaching the model is read with `frappe.get_list`, so it is limited to what the current user may read. The API key is stored in a Password field and never sent to the browser. Requests are rate-limited per user (`ask` 40/h, `extract_document` 60/h), and the AI endpoints are limited to desk (System) users — portal users cannot call them.

## Files

```
reckon_aura_theme/
├─ hooks.py                     includes, boot, install hooks
├─ boot.py                      frappe.boot.aura (public config only)
├─ install.py                   seeds settings defaults
├─ api.py                       get_brief · ask · extract_document · test_connection · get_login_config
├─ reckon_aura_theme/doctype/aura_theme_settings/   Single DocType
└─ public/
   ├─ css/aura_desk.css         tokens + desk skin + Aura UI
   ├─ css/aura_web.css          login / update-password skin
   ├─ js/aura_desk.js           prefs, navbar tools, Ask panel, brief, Fill with AI
   └─ js/aura_web.js            login hero
```

## Customising

- **Colours:** every colour comes from `--aura-*` variables at the top of `aura_desk.css`. Change `--aura-accent` / `--aura-accent-2`, or use the Custom accent in settings.
- **Glass:** set *Glass Blur* to `0` for low-powered machines; turn off *Aurora Background Glow* for a flat ground.
- **Fonts** load from Google Fonts. For offline / air-gapped sites, vendor Sora + Geist into `public/fonts` and replace the `@import` lines.

## Compatibility notes

- Built for Frappe **v16** (`/desk`), with selectors that also cover v15 class names.
- The navbar tools try the v16 desktop navbar, then the v15 navbar, and otherwise float as a dock in the bottom-right corner.
- No core templates (`app.html`, `login.html`) are overridden, so Frappe upgrades stay safe.
- After upgrading Frappe, check list rows, the sidebar and kanban. Those are the selectors most likely to change between minor versions.

## License

MIT
