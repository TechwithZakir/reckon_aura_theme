# Reckon Aura AI as an agent: what we learned, and what is still missing

Written 2026-11-19 from real setup work on the Sales AI Agent. Read this before building Aura features that *do* things
(not only answer). The customer-facing recipes live in `reckon_aura_theme/skills/*.md`; this file is for builders.

## What Aura can already do

Answer from the guides, turn menu names into links, show prompts, fill sales and purchase documents from pasted text
(Fill with AI), and explain errors. It cannot yet change anything by itself.

## Missing features (build in this order)

1. **Set up from a website.** Input: the company URL. Steps: fetch the site and its industries and product pages,
   extract the profile fields (see "Set up the business profile from the company website" in `sales_agent_skills.md`),
   show a draft the person edits, save it, then offer "Research my market". Never invent competitors or customers;
   leave them empty. Chip fields split at commas, so give one item per chip with no commas inside.
2. **Action tools with approval.** A small set of tools Aura may call on the person's behalf: open a page, prefill a
   form, run a read-only report, create a draft. Every write needs a visible approval step; money, deletion, outside
   messages and credentials are never done by Aura. Log each call to the activity log with the person as actor.
3. **Setup agent.** Walk the "Get started" checklist of a product, check each step is truly done, and say what is
   missing. Use the same checks the Home page already computes.
4. **Walkthrough recorder.** Record a flow in the browser as a GIF or step list for training material.
5. **Safe data reset.** An admin-only flow: count what will go, take a database backup, ask for exact scope, delete
   only the named company's records, assert other companies are unchanged, write an audit row. Never offer it to
   non-admins.

## Learned while setting up Reckon Technologies Ltd. (2026-11-19)

- **One AI setup for Aura and the Sales Agent.** Aura Theme Settings holds provider type, address, model and key. The
  type can be "Anthropic" with a custom address (an Anthropic-compatible service) and any model that service offers.
  The Sales Agent platform settings now accept the same: provider "Anthropic (Claude)", an "Anthropic-compatible
  address", a model and a key. A compatible address gets a plain request with the JSON schema in the instructions
  (structured-output options are Anthropic-only). Copying values between the two is done on the server, never shown.
- **A dead AI account looks like missing features.** When the AI account has no credit, agents fall back to rules and
  produce poor results (a market brief that crosses every industry with every buyer type). Say so plainly, and a
  setup agent should test the AI with one tiny request before starting a research job.
- **Chip fields (business profile) only turn into chips when separated by commas or Enter.** One long item without a
  comma is silently dropped; items containing commas are split. A form-filling tool must send one item at a time.
- **Do not press Save and Research together.** Both save the profile; the second is refused as "modified after you have
  opened it". Wait for the save, or let Research save by itself.
- **A reset needs more than deleting rows.** Clear links in kept records that pointed at deleted ones (the profile's
  latest brief), and expect agents to create new rows (a market brief) the moment a page opens.

## Lessons from the HR setup agent (a chat that asks, then acts)

- **A text answer is not a setup.** The model will happily write a how-to when asked to "guide me". A guided action needs an
  agent (a state machine in the chat that asks one question at a time and applies the plan itself), and a plain question that
  is really a request must start that agent. Both are built: `aura_agents` and `aura_agent_intents` in an app's hooks. See the
  "Agents" section of `reckon_aura_theme/skills/README.md`.
- **Frappe hands hook values back in lists** (`{"name": ["path"]}`). Read the last item before calling `frappe.get_attr`.
- **Rehearse an apply step on production inside a transaction.** Replace `frappe.db.commit` with a no-op in the script, run the
  whole conversation, print what exists, then roll back and print that it is gone. It found bugs a unit test could not.
- **The agent state is the browser's.** Clean it on every turn and rebuild the plan on the server before any write.
- **Shared masters are not the company's.** Designation, Leave Type, Salary Component and Overtime Type are shared catalogs:
  an agent may add to them but must not change or delete what other companies use.

## Hard rules for every agent tool

- **Tenant isolation first.** Every query and write is limited to the signed-in person's Company. One company's data is
  never shown to another company's admin, in answers, previews, counts or errors. Test it with two companies.
- **People approve what goes out.** No message, payment, subscription or credential change without a person.
- **Facts only.** Quote errors exactly; say "not documented" instead of guessing; never invent contact details.
- **Keep guides current.** Any screen, rule or menu change updates its guide, its Links and its prompts in the same change.

## Platform lessons (Frappe v16) that cost time

- The menu Desk shows is a **Sidebar record**; the `workspace_sidebar/*.json` file only seeds it. Changing the file
  needs a patch that updates the Sidebar record, or users see the old menu.
- Desk caches page scripts and the page title in the browser. Changing a page's title or script needs the Page record
  touched (a patch or a migrate), and testers need a hard refresh.
- Hooks run with `ptype`, not `permission_type`; tenant filters must accept it.
- Page and list HTML is easiest to test by reading the file text in unit tests; run the whole suite in an environment
  with `requests` and `beautifulsoup4`, or errors hide real failures.
- After every push, read the GitHub CI result for that commit and fix it before reporting done.
- A heading font set on `h1`-`h4` reaches small in-page labels; style labels explicitly in the theme body font.
- Pagination, search and sort for any list: use `rsa_tables.enhance` (Sales Agent) or the SaaS Dashboard `defineTable`.
