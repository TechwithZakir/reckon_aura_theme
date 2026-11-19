# Sales AI Agent support guide

Sales AI Agent finds, researches, scores and follows up B2B customers, with a person approving anything sent
outside. It works with Reckon CRM on the same company. AI and channel (SMS, WhatsApp, email provider) usage is billed
separately from the subscription. Open it from the Apps screen; it opens on Sales Analytics, the first item in the sidebar. The Campaign group holds Campaigns, Signup forms and lists, Automations, Message templates, Messages sent and the Do-not-contact list.

## Where things are (pages)

Sales Analytics (the landing page, first in the sidebar), Setup (Get started), Agent Studio (Home), Inbox (conversations and replies), Meetings, Lead Finder, Prospect Review,
Campaign Studio, Capture Studio (forms and landing capture), Automation Studio (flows), Templates,
Integrations (Channels), Agent Settings. Records: Prospects, Segments, Audiences, Campaigns, Campaign
Members, Targeting Profiles, Discovery Campaigns and Jobs, Research Reports, Qualification Profiles, Suppression
list, Knowledge items, Social accounts and posts.

## The flow

1. **Setup:** describe your business (Business Profile) and the customers you want (Targeting Profile: market,
   industries, segments, keywords in English and Bangla, places, exclusions).
2. **Find:** Discovery campaigns search the sources you enabled (demo data, CSV import, Google Places and similar
   providers, permitted directories). Bounded by per-job limits; re-runs do not duplicate.
3. **Research and score:** it reads at most a few pages of each website, keeps evidence for every fact, and scores
   with fixed, explainable rules. A manager can override with a reason.
4. **Review:** Prospect Review to approve, reject, defer, merge or re-research.
5. **Sync:** approved prospects become CRM Organization and Lead in your company, filled where empty, never
   overwritten.
6. **Follow up:** campaigns with email, SMS, WhatsApp, call and LinkedIn task steps. Messages need approval by default
   (campaign and each message); SMS and WhatsApp only go to people with recorded consent.
7. **Replies:** classified (interested, meeting, question, not now, not interested, wrong person, unsubscribe,
   out of office); opt-outs are suppressed and sequences stop; positive replies create a task for the lead owner.
8. **Learn:** Sales Analytics by channel and step, with weekly AI insight built from aggregate numbers only.

## Safety rules (always explain)

Outbound sending is off by default (approved messages are logged as dry runs until enabled). Before each send the
agent re-checks kill switch, subscription, suppression list, approval, daily limits and monthly quota. Everything
privileged is audited. Fields a source does not allow to keep are never stored.

## Common problems and fixes

- **No leads found:** check the Targeting Profile (terms and places), the source is enabled and has its API key, and
  the job's limit.
- **Messages not sent:** outbound is off, approval is pending, the contact lacks consent, the member is suppressed, or
  a daily or monthly limit is reached.
- **AI features say unavailable:** the platform operator has not enabled an AI provider or the monthly AI quota is
  used; ask the administrator.
- **Duplicate prospects:** possible duplicates are flagged for review, never merged automatically.
- **Thread list refused:** the person's company has no Sales Agent subscription or access.

## Building an autonomous sales agent

Start with one Targeting Profile and a small discovery campaign in review mode; read the results; add a scoring
threshold; turn on auto-approve only for strong prospects with a daily cap; add a three-step email sequence with
approval; add reply handling; schedule discovery weekly; review analytics monthly and tighten the profile.

## Copilot ideas

Write a Targeting Profile from a description of the business (in English and Bangla terms), draft campaign steps and
subject lines, review why a prospect scored low, summarise a conversation, suggest the next message.

## Links

Menu names that become links in Ask Aura AI answers (label | address). Keep these in step with the menus.

- Sales AI Agent | /desk/sales-agent
- Agent Studio | /desk/sales-agent
- Setup | /desk/sales-agent/sales-setup
- Inbox | /desk/sales-agent/sales-inbox
- Meetings | /desk/sales-agent/sales-meetings
- Lead Finder | /desk/sales-agent/lead-finder
- Prospect Review | /desk/sales-agent/sales-review
- Campaign Studio | /desk/sales-agent/campaign-studio
- Capture Studio | /desk/sales-agent/capture-studio
- Automation Studio | /desk/sales-agent/automation-studio
- Templates | /desk/sales-agent/sales-templates
- Sales Analytics | /desk/sales-agent/sales-analytics
- Campaign Analytics | /desk/sales-agent/sales-analytics
- Integrations | /desk/sales-agent/sales-channels
- Agent Settings | /desk/sales-agent/sales-agent-settings
- Targeting Profile | /desk/sales-agent/sales-targeting-profile
- Prospects | /desk/sales-agent/sales-prospect

## Prompts to try

- Help me write a Targeting Profile for my business.
- How do I find 50 distributors in Dhaka and follow up safely?
- Why were no messages sent from my campaign?
- Draft a three-step email sequence for new leads.
- How does auto-approve work and what are its limits?
- How do I connect WhatsApp and SMS?
- What does this prospect's score mean?
- How do I set up an autonomous agent for weekly lead finding?
- How do I see what the agent did last week?

## Prompts to try (Bangla)

- আমার ব্যবসার জন্য টার্গেটিং প্রোফাইল লিখতে সাহায্য করুন।
- ঢাকায় ৫০টি পরিবেশক খুঁজে নিরাপদে ফলো-আপ করব কীভাবে?
- আমার ক্যাম্পেইনের বার্তা কেন যায়নি?
