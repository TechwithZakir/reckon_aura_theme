# ReckonBooks support guide

ReckonBooks (the Accounts module) is complete accounting, sales, purchase, inventory and stock software for one
company per subscription. It is built on ERPNext's accounting and stock engine with simpler screens, Tally-style
books and Bangla/English labels. Standard ERPNext behaviour is authoritative; this guide covers what ReckonBooks
changes. Menu: open ReckonBooks from the Apps screen (`/desk/accounts-saas`), Home first.

## Where things are

- **Home:** key numbers, a get-started checklist, quick actions, recent items.
- **Sales:** Sales Invoices, Quotations, Sales Orders, Delivery Notes, Customers.
- **Purchase:** Purchase Bills, Purchase Orders, Goods Received, Suppliers.
- **Money:** Payments (Payment Entry), Voucher Entry (fast Tally-style entry), Office Expenses, Journal Entries,
  Chart of Accounts.
- **Stock:** Items, Stock Entries, Stock Count (reconciliation), Warehouses, Stock Balance.
- **Reports:** Accounts Dashboard, Day Book, Cash Book, Party Ledger, Accounts Receivable and Payable, Sales and
  Purchase Register, Gross Profit, Profit and Loss, Balance Sheet, Trial Balance, voucher registers, funds flow.
- **Setup:** Team and Access (Company Admin only), Office Expense Setup, Price Lists, Sales and Purchase Tax
  Templates, Company (read-only).

## Company separation rules (explain these, do not work around them)

- A company sees only its own invoices, payments, stock, customers, suppliers, items and price lists.
- The company record is read-only for tenants; vendor staff change it.
- Shared lists (UOM, Mode of Payment, Fiscal Year, Stock Entry Type, Terms and Conditions, Payment Terms Template,
  Tax Category, Item Group, Brand, Customer Group, Supplier Group, Territory) show vendor rows that cannot be edited;
  rows the company adds are its own. Accounts Settings, Stock Settings, Party Type are read-only.
- Each company has its own price lists, named "<Company> Selling" and "<Company> Buying". New documents default to
  them. The stock "Standard Selling" list belongs to another company.

## How to (core flows)

**Sell and get paid:** Customers > New (name, type) > Items > New (name, group, unit; tick Maintain Stock only for
stock items) > Sales Invoices > New: pick the customer, add item rows (name, unit, income account fill in
automatically), Save, Submit > Payments > New: Receive, party type Customer, party, choose Mode of Payment, add the
invoice under references, Submit. The invoice becomes Paid.

**Buy:** Suppliers > New > Purchase Orders > Goods Received (updates stock) > Purchase Bills > Payments (Pay).

**Stock:** Stock Entries (receipt, issue, transfer), Stock Count to correct balances, Stock Balance to review.

**Expenses:** Office Expenses is the compact form for day-to-day costs; set categories and payment accounts once in
Office Expense Setup.

**Month end:** Trial Balance agrees; Profit and Loss and Balance Sheet for the fiscal year; Accounts Receivable and
Payable reviewed; Cash Book and Day Book checked against cash in hand.

## Common problems and fixes

- **Sales or Purchase Register says No record found:** only submitted invoices appear; check company, dates, and that
  the invoice is not a draft.
- **"Price List ... is not available in your company":** choose "<Company> Selling" (or Buying).
- **Item row stays empty or asks for Item Name, Unit, Income Account:** the item or price list was not accepted;
  fix the price list first, then re-pick the item.
- **Payment Entry needs Mode of Payment:** choose Cash or the bank mode; the paid-to account follows the company's
  cash or bank account.
- **Cannot edit Company, UOM, Mode of Payment or a vendor row:** these are read-only for companies by design; add
  your own row if you need a variant.
- **A page says it is not available:** the company's plan or the person's role does not include it; check Team and
  Access and the subscription.
- **Reports show another company's name in the Company filter:** reload; the filter should read your company.

## Copilot ideas

Draft an invoice from a pasted order (Fill with AI on Sales Invoice, Sales Order, Quotation, Purchase documents),
explain a ledger, suggest which report answers a question, walk through month-end close, explain GL entries for a
posted voucher.

## Autopilot limits

ReckonBooks does not post by itself. Suggest saved report filters, recurring reminders for overdue invoices (draft a
Bangla message), and a checklist the owner runs weekly. Payments and submits stay with a person.

## Links

Menu names that become links in Ask Aura AI answers (label | address). Keep these in step with the menus.

- ReckonBooks | /desk/accounts-saas/accounts-home
- Sales Invoices | /desk/sales-invoice
- Sales Invoice | /desk/sales-invoice
- Quotations | /desk/quotation
- Sales Orders | /desk/sales-order
- Delivery Notes | /desk/delivery-note
- Customers | /desk/customer
- Purchase Bills | /desk/purchase-invoice
- Purchase Orders | /desk/purchase-order
- Goods Received | /desk/purchase-receipt
- Suppliers | /desk/supplier
- Payments | /desk/payment-entry
- Payment Entry | /desk/payment-entry
- Voucher Entry | /desk/accounts-saas/voucher-entry
- Office Expenses | /desk/office-expense
- Office Expense Setup | /desk/office-expense-settings
- Journal Entries | /desk/journal-entry
- Chart of Accounts | /desk/account
- Items | /desk/item
- Stock Entries | /desk/stock-entry
- Stock Count | /desk/stock-reconciliation
- Warehouses | /desk/warehouse
- Price Lists | /desk/price-list
- Team and Access | /desk/accounts-saas/accounts-team
- Accounts Dashboard | /desk/accounts-saas/accounts-dashboard
- Stock Balance | /desk/query-report/Stock Balance
- Day Book | /desk/query-report/Day Book
- Cash Book | /desk/query-report/Cash Book
- Party Ledger | /desk/query-report/Party Ledger
- Accounts Receivable | /desk/query-report/Accounts Receivable
- Accounts Payable | /desk/query-report/Accounts Payable
- Sales Register | /desk/query-report/Sales Register
- Purchase Register | /desk/query-report/Purchase Register
- Gross Profit | /desk/query-report/Gross Profit
- Profit and Loss | /desk/query-report/Profit and Loss Statement
- Balance Sheet | /desk/query-report/Balance Sheet
- Trial Balance | /desk/query-report/Trial Balance

## Prompts to try

- Show me, step by step, how to raise a sales invoice and record the customer's payment.
- Which customers have overdue invoices, and what should I say to them?
- How do I set up my items and opening stock?
- What do I check before closing the month in ReckonBooks?
- Why does my Sales Register show No record found?
- How do I add a new supplier and record a purchase bill?
- Explain the Trial Balance in simple words.
- How do I use Voucher Entry like Tally?
- What is the difference between a Sales Order, a Delivery Note and a Sales Invoice?
- Help me set the right user access for my sales and accounts staff.

## Prompts to try (Bangla)

- কীভাবে বিক্রয় ইনভয়েস তৈরি করে গ্রাহকের পেমেন্ট এন্ট্রি করব?
- মাস শেষে ReckonBooks-এ কী কী মিলিয়ে দেখব?
- নতুন আইটেম ও স্টক কীভাবে যোগ করব?
- আমার সেলস রেজিস্টারে কেন কিছু দেখাচ্ছে না?
