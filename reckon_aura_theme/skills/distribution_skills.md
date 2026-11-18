# Distribution (FMCG) support guide

Distribution is route sales, deliveries, collections and stock for FMCG distributors, wholesalers and van-sales
teams, Bangla-first, with a mobile-friendly workflow. It runs on ERPNext stock and accounting; each subscribing
company is separate. Open it from the Apps screen (`/desk/distribution`). Product-specific screens below are
Reckon's; standard ERPNext behaviour stays authoritative.

## Where things are

- **Distribution Home:** the day at a glance and quick actions.
- **Sales and Delivery:** SR Sales (an SR order from a field sales representative), DSR Delivery and Collection
  (delivery against orders and cash/due collection by the delivery representative), DSR Challan (the delivery
  challan), DSR Day Settlement (close the day: cash carried, returns, shortages).
- **Purchase:** Purchase Orders, Purchase Received (goods in, including goods supplied free by a principal),
  Purchase Invoices, Supplier Payments.
- **Office Expenses:** the compact expense form.
- **Reports:** Stock Ledger, Stock Balance, Sales Register, Purchase Register, Accounting Ledger, Day Book, Cash Book,
  Supplier Ledger, Supplier and Customer Aging, DSR Wise Ledger, Ledger Summary, Profit and Loss.
- **Setup and Access:** Office Expense Setup, Distribution Master Setup (routes, outlet and master scope), Company
  Team and Access.

## Daily flow

1. Set routes and assign retailers to routes (Distribution Route, Retailer Route Assignment).
2. SRs take orders (SR Order / SR Sales) during visits (Outlet Visit records the visit).
3. Load the van and acknowledge the loading (Van Loading Acknowledgement).
4. DSRs deliver against orders, issue the challan, and collect cash or record dues.
5. At day end, settle the DSR (DSR Day Settlement) and review returns (Return Inspection).
6. Receive purchases, pay suppliers, and check ledgers and aging.

## Common problems and fixes

- **Retailer dues do not match:** open Customer Aging and DSR Wise Ledger for the date; check unsettled challans and
  collection receipts.
- **Cash carried differs at settlement:** compare collection receipts, expenses and returns for that DSR and day.
- **Stock shows less than expected:** open Stock Ledger for the item and warehouse; look for unreceived purchases,
  returns pending inspection, and goods supplied free by principals (tracked separately).
- **A record "belongs to another company":** use your company's own master; masters are not shared.
- **A page is not available:** the company's plan or role does not include it; check Team and Access.

## Company separation

Customers, suppliers, items, routes, challans and settlements belong to one company. Distribution masters are
scoped per company through the Distribution Master Scope.

## Copilot ideas

Check a route's collection against dues, draft a reminder to retailers in Bangla, explain a day settlement variance,
suggest a reorder from stock and sales, outline a new route plan.

## Autopilot limits

Aura does not post deliveries or settlements. It can prepare a checklist for each role (SR, DSR, store, accounts)
and the reports to review daily.

## Prompts to try

- How does a DSR settle the day, step by step?
- How do I set up routes and assign retailers?
- Why does a retailer's due not match my report?
- How do I receive goods supplied free by a principal?
- Which report shows what each DSR collected today?
- How do I record a sales return and inspect it?
- What should the store check at van loading?
- How do I give my SR team access to take orders?

## Prompts to try (Bangla)

- DSR দিনের হিসাব কীভাবে মেলাব (Day Settlement)?
- নতুন রুট ও রিটেইলার কীভাবে সেট করব?
- রিটেইলারের বকেয়া রিপোর্টে মিলছে না, কী দেখব?
- SR অর্ডার কীভাবে নেবে?
