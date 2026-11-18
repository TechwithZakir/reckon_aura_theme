# Aura AI skills: how to keep them current

Reckon Aura AI answers from the guides in this folder. A guide is advice for the model, so it must match what the
product really does today. **Whenever a ReckonERP module is built or changed, update its guide in the same change.**

## What each file is

| File | Product |
|---|---|
| `aura_playbook_skills.md` | How Aura helps: helpdesk steps, copilot, autopilot limits, building agents, prompt guidelines. Attached to every question. |
| `reckonbooks_skills.md` | ReckonBooks (accounting, sales, purchase, inventory, stock) |
| `reckon_hrms_skills.md` | Reckon HRMS, HR Studio, Payroll Studio |
| `distribution_skills.md` | Distribution (SR/DSR, FMCG) |
| `reckon_crm_skills.md` | Reckon CRM, Field Visits |
| `sales_agent_skills.md` | Sales AI Agent |
| `account_platform_skills.md` | Signup, plans, subscription, billing, team and access |
| `retail_loyalty_skills.md` | Retail Loyalty |
| `accounts`, `selling`, `buying`, `stock`, `hr`, `manufacturing`, `crm_projects`, `custom_module` | Standard ERPNext concepts |

## When to edit

- A new page, menu item, doctype, report or setting users meet: add it under "Where things are" and "How to".
- A new error message or a rule users trip over: add it under "Common problems and fixes" with the exact text.
- A rule about company separation, access or billing changed: update that section.
- A new automation or AI feature: update "Copilot ideas" and "Autopilot limits".
- A new or renamed page, report or menu item: add or change its line under `## Links` (`- Label | /address`). Ask Aura AI turns those names in answers into links that open in a new tab, so a wrong address sends users to the wrong page.
- Always add or refresh two or three prompts under "Prompts to try" (and the Bangla list): these are what people see
  on the Ask Aura AI welcome, so make them questions a real user would ask.

## How to add a new product

1. Write `<product>_skills.md` with these headings: what it is, where things are, flows, common problems and fixes,
   company separation, copilot ideas, autopilot limits, `## Links` (menu names and addresses), `## Prompts to try` (6+) and `## Prompts to try (Bangla)` (2+).
2. Register it in `SKILL_GUIDES` in `api.py` (id, title, file, `routes` that appear in the Desk address, `markers`
   words people use). Put product guides before the generic ERPNext ones.
3. Add the product to `PRODUCT_GUIDES` in `tests/test_skills.py`.
4. Keep each file under 16,000 characters (the playbook under 8,000).

## Rules for writing

Facts only: say "available on request" or "not documented here" rather than guessing. Quote messages exactly. Never
include customer data, keys or passwords. Prefer short numbered steps with the menu path. Keep Bangla natural and
keep menu names in English where helpful.

Run `python -m unittest tests.test_skills` before committing.
