# Reckon CRM support guide

Reckon CRM is leads, deals, organizations and contacts for a sales team, in a private workspace per company, with
**Field Visits** for field sales. It extends the Frappe CRM app (a separate app; upstream behaviour is
authoritative). Open it at `/crm` (the Reckon CRM tile). Each company sees only its own leads, deals,
organizations, tasks and notes.

## Where things are

Sidebar: Dashboard, Leads, Deals, Contacts, Organizations, Notes, Tasks, Call Logs, and **Field Sales > Field
Visits**. Lead and Deal pages have a Visits tab.

## Core flows

- **Capture a lead:** Leads > Create; fill name, organization, contact, source. Leads come in from the Sales AI Agent
  and web forms too.
- **Qualify and convert:** open the lead, work it (calls, notes, tasks), then convert to a Deal with an organization.
- **Move deals:** Deals board by status; set value, probability, next step and close date; mark Won or Lost with a
  reason.
- **Tasks and notes:** add a task with due date and assignee; notes keep the history on the timeline.
- **Field visits:** Field Visits > Schedule visit for a lead, deal or organization; pick users (up to 25), date and
  time, purpose and the customer's location on the map. At the visit the rep checks in and out; the server checks the
  geofence (or marks the visit unverified when GPS is not available); there is no background tracking. A completed
  visit is final: outcome, notes, follow-up date, photos. Optional sync writes calendar events, CRM tasks and HR
  check-ins (System Manager settings).

## Common problems and fixes

- **Cannot see a colleague's lead:** access follows the company's roles and the lead's owner; check Team and Access.
- **No Field Visits item:** the feature is part of Reckon CRM; confirm the module is in the subscription and the
  assets were rebuilt after an update.
- **Check-in says unverified:** GPS or permission was off, or the rep was outside the geofence radius.
- **A lead from the Sales Agent has no owner:** assign an owner on the lead; ownership routes follow-up tasks.
- **Duplicate organizations:** merge them and keep one; avoid re-creating from imports.

## Company separation

Leads, Deals, Organizations are owned by one company. Tasks and notes belong to the company of the user who made them.
Status lists and form layouts are shared, read-only configuration.

## Copilot ideas

Draft a follow-up email or WhatsApp message, summarise a lead's history, suggest the next step for a stalled deal,
plan a day of field visits, write a call script.

## Autopilot limits

Sales AI Agent can create leads, score them, create follow-up tasks and raise deal probability; messages to outside
people still wait for approval. Aura suggests; people confirm.

## Links

Menu names that become links in Ask Aura AI answers (label | address). Keep these in step with the menus.

- Reckon CRM | /crm
- Dashboard | /crm/dashboard
- Leads | /crm/leads
- Deals | /crm/deals
- Contacts | /crm/contacts
- Organizations | /crm/organizations
- Notes | /crm/notes
- Tasks | /crm/tasks
- Call Logs | /crm/call-logs
- Field Visits | /crm/visits

## Prompts to try

- How do I turn a lead into a deal?
- What should I do with deals stuck in the same stage for two weeks?
- How do I schedule a field visit for my team?
- Write a short follow-up message for a lead who asked for a quotation.
- How do I import my existing leads?
- Which leads should I call first today?
- How do I give my sales reps access to Reckon CRM?
- How do I see only my own leads and deals?

## Prompts to try (Bangla)

- লিডকে ডিলে রূপান্তর করব কীভাবে?
- ফিল্ড ভিজিট কীভাবে শিডিউল করব?
- একজন লিডকে ফলো-আপের জন্য ছোট একটি বার্তা লিখে দিন।
