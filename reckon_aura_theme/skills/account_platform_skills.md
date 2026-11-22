# ReckonERP account, subscription and team guide

The ReckonERP platform runs one **company** per subscription. A company subscribes to products (ReckonBooks, Reckon
HRMS, Reckon CRM, Sales AI Agent, Distribution) directly or through the ReckonERP plan, and invites its own people.
This guide covers signup, plans, billing, team access and the account pages.

## Plans and trial

- Every product has Basic, Standard and Enterprise plans, monthly or yearly, in Bangladeshi taka (BDT) or US
  dollars (USD). A 15-day free trial applies where shown on the plan.
- **ReckonERP** is the suite: ReckonBooks and Reckon HRMS (and Reckon CRM) in one subscription and one invoice, with
  biometric attendance, the mobile app and app-based geo check-in; the top plan also includes Sales AI Agent.
  Assets and project management are available on request. AI and channel usage is billed separately.
- Compare plans at `/pricing`; each product has a page at `/modules/<product>`.

## Signup and first login

Signup (`/reckonerp-signup`) asks for company, owner details and the plan (choose the module or suite, currency and
billing cycle). The owner becomes the company's first user and **Company Admin**. After signup open the product from
the Apps screen; the Home page of each product guides the first steps.

## Subscription page (`/reckonerp-subscription`)

Top card: the company name and whether operational access is enabled. Tabs: **Plans and billing** (each subscription,
its price and renewal), **Invoices**, **Add a module**, **Setup**. Pay by card (renews automatically) or, where
offered, report a bank transfer or mobile-wallet payment with its reference for verification. Manage or cancel a
card subscription from the same page. Workspace access unlocks when payment succeeds or a manual payment is
verified; during a grace period or after a failed payment the workspace may lock until payment is made.

## Team and access (`/reckonerp-team` and the product's Team and Access page)

Company Admins add people, give each a **role profile** per product (for example Company Admin, Company Manager,
Accountant, Sales User, Purchase User, Stock User in ReckonBooks), switch access on or off, and change a person's
modules. Choose the narrowest profile that lets the person do the job. New users start with the standard list, form
and report preferences switched on and the company as their default.

## Common problems and fixes

- **"X is not available in your workspace":** the product or page is not in the subscription or the person's profile.
- **Locked workspace after payment:** open the Subscription page; if a manual payment is pending, add the reference;
  card payments unlock on success.
- **A user cannot see a product:** check the person's modules on Team and Access and the company's subscription.
- **Want another product:** Subscription > Add a module, or ask support for assets and projects.
- **Invoice or receipt needed:** Subscription > Invoices (PDF).
- **Cannot change the company name or details:** the company record is managed by Reckon; ask support.

## Support

Email support@reckon.tech or WhatsApp +8801325-009955 (www.reckon.tech). Say what you were doing, the exact message and
your company name; hide customer, employee and bank details in screenshots. Support is by email and WhatsApp; Aura
has no other contact details to give.

## Copilot ideas

Compare plans for a business size and currency, explain what a subscription includes, plan which staff get which
role profile, draft a request to add a module.

## Autopilot limits

Aura cannot pay, subscribe or change access. It explains, compares and drafts; the company admin acts.

## Links

Menu names that become links in Ask Aura AI answers (label | address). Keep these in step with the menus.

- Subscription page | /reckonerp-subscription
- Subscription | /reckonerp-subscription
- Team and Access | /reckonerp-team
- Plans and pricing | /pricing
- ReckonERP plan | /modules/reckonerp
- Signup | /reckonerp-signup

## Prompts to try

- Which ReckonERP plan fits a 20-person trading company?
- How do I add a user and choose their access?
- How do I pay by card, and what happens at renewal?
- How do I add Reckon CRM or Sales AI Agent to my subscription?
- What does my subscription include?
- Why is my workspace locked and how do I unlock it?
- How do I download an invoice?
- How should I split access between accounts, sales and stock staff?

## Prompts to try (Bangla)

- ২০ জনের ব্যবসার জন্য কোন ReckonERP প্ল্যান ঠিক হবে?
- নতুন ব্যবহারকারী যোগ করে অ্যাক্সেস কীভাবে দেব?
- আমার সাবস্ক্রিপশনে কী কী আছে?

## Vendor: enabling plans and paying a year at once

- SaaS Dashboard, Plans table: each price row has an On/Off switch, and "Whole plan" switches every currency and cycle of that tier together. Off hides it from pricing and signup; running subscriptions continue.
- A Monthly SaaS Plan row has "Allow paying a year at once" and "Months charged for the year" (1 to 12, set per currency row, no default). There is no separate Yearly plan: the Monthly row sells both, the yearly price is monthly price x months (worked out on save), and signup, pricing, subscription, invoices, coupons and the Paddle yearly price all read that one row. Disabling the option retires its Paddle yearly price.
