# Accounts support guide

This guide helps users understand common accounting workflows and choose the
next useful step. It describes standard ERPNext behavior, not the live setup of
any particular site.

## Source priority and limits

- The official ERPNext documentation is authoritative for standard ERPNext
  behavior.
- Reckon Accounts is an add-on over ERPNext. Its repository documents
  product-specific reports and navigation; it does not replace ERPNext's
  accounting engine.
- A report, field, or workflow may be unavailable because of the installed
  app/version, site configuration, or the user's permissions. Do not promise
  that a feature is present without checking.
- Menu paths can vary by version or workspace customization. If a path is not
  visible, suggest Desk search and checking the user's role/permissions.
- Give instructions only. Do not claim to save, submit, reconcile, or change
  accounting records.

## Chart of Accounts

Use the Chart of Accounts to organize a Company's ledger accounts under
Assets, Liabilities, Equity, Income, and Expenses.

1. Open **Accounting > Accounting Masters > Chart of Accounts** and select the
   Company.
2. Use group accounts to organize the tree; use ledger accounts for postings.
   Group accounts do not receive General Ledger entries.
3. Before adding an account, confirm its parent, root type, account type, and
   purpose. Prefer Cost Centers, Projects, or Accounting Dimensions for
   analysis such as department or branch instead of creating excessive
   duplicate accounts.
4. Do not delete an account with transaction history. Review its defaults and
   postings before disabling, moving, renaming, or changing its group/ledger
   status.
5. Test the intended account filters in draft transactions, then verify a
   controlled submitted transaction in the General Ledger and financial
   statements.

If an account is missing from a transaction, check its Company, account type,
root type, disabled status, and whether it is a group account.

## Sales Invoice

A Sales Invoice records the amount a Customer owes. Submitting it posts the
receivable, income, and applicable taxes to the General Ledger.

Before creating one, check the Customer, Items, income accounts, taxes, price
list, payment terms, and Warehouse if stock is involved.

1. Open **Accounting > Sales and Receivables > Sales Invoice**.
2. Select the Company and Customer; review the posting date, due date,
   currency, items, quantities, rates, taxes, and total.
3. Create it from a Sales Order or Delivery Note when those documents already
   represent the order or delivery. Check quantities and references.
4. Use **Update Stock** only when the invoice itself should record the stock
   movement. Do not enable it when a Delivery Note has already recorded that
   movement.
5. Save as a draft for review. Submit only when the invoice is ready to affect
   the books.

After submission, use the invoice's accounting view or the General Ledger to
trace its effect. A draft does not post to the books.

## Payment Entry

Use a Payment Entry to record money received, money paid, or a transfer
between company bank/cash accounts. It can allocate a payment to one or more
invoices, record a partial payment or advance, or leave an amount unallocated
for later allocation.

- **Receive:** normally debits Bank/Cash and credits the Customer receivable.
- **Pay:** normally debits the Supplier payable and credits Bank/Cash.
- **Internal Transfer:** moves money between company accounts.

Select the correct Company, party, payment type, bank/cash accounts, date,
amount, and invoice references. Review allocations before submitting. Use a
Payment Entry for a real movement of money; use a Journal Entry for an
accounting adjustment that is not a payment.

If an invoice remains outstanding after a payment, check that the Payment
Entry is submitted and allocated to the correct invoice. An unallocated
payment may need Payment Reconciliation; that is different from matching a
voucher to a bank statement.

## Bank Reconciliation

Bank Reconciliation matches ERPNext accounting vouchers with bank statement
transactions. It is distinct from Payment Reconciliation, which allocates
party payments to invoices.

1. Select the Company Bank Account and statement date range.
2. Import or synchronize bank transactions if that workflow is configured.
3. Match statement lines to the correct submitted Payment Entry, Journal
   Entry, or other supported voucher.
4. Check for an existing voucher before creating a missing entry; avoid
   recording the same bank movement twice.
5. Record fees, interest, and other missing transactions using the
   appropriate accounting document, then match them.
6. Investigate any remaining balance difference. Check dates, opening
   balance, uncleared entries, duplicate imports, fees, and transfers rather
   than forcing the difference to zero.

Reconciliation records bank clearance; it does not necessarily change the
voucher's original accounting posting date.

## Choosing an accounting report

- **General Ledger:** trace the transactions and debit/credit postings behind
  an account balance.
- **Trial Balance:** check account-level opening, period, and closing totals.
- **Balance Sheet:** review assets, liabilities, and equity at a date.
- **Profit and Loss Statement:** review income and expenses over a period.
- **Cash Flow:** review cash movement over a period.
- **Accounts Receivable / Accounts Payable:** review customer/supplier
  outstanding amounts and ageing. Ageing is not by itself proof that an
  invoice is overdue; check its due date and payment terms.
- **Payment Ledger / Payment Reconciliation:** investigate payment allocation
  and outstanding differences.
- **Bank Reconciliation Statement:** review cleared and uncleared bank
  entries.

Use the same Company, date range, currency, and other relevant filters when
comparing reports. A report usually reflects submitted transactions; inspect
the source voucher when a total needs explanation.

## Reckon Accounts reports

The Reckon Accounts app adds Tally-oriented accounting views on top of ERPNext.
Its report catalog includes views such as Party Ledger, Account Ledger,
General Ledger Custom, Day Book, Cash Book, Bank Book, Receipt Register,
Payment Register, and Contra Register. **General Ledger Custom** is a
Reckon Accounts view; it is not the standard ERPNext General Ledger.

The catalog also links to standard ERPNext reports, including General Ledger,
Trial Balance, Balance Sheet, Profit and Loss Statement, Cash Flow, Accounts
Receivable, Accounts Payable, and Bank Reconciliation Statement. Availability
depends on the Reckon Accounts app being installed, the supported version, and
user permissions. If a named report is not available, direct the user to the
closest standard ERPNext report rather than implying the custom report exists.

## References

### Official ERPNext documentation

- [Accounting Introduction](https://docs.frappe.io/erpnext/accounting-introduction)
- [Chart of Accounts](https://docs.frappe.io/erpnext/chart-of-accounts)
- [Sales Invoice](https://docs.frappe.io/erpnext/sales-invoice)
- [Payment Entry](https://docs.frappe.io/erpnext/payment-entry)
- [Bank Reconciliation](https://docs.frappe.io/erpnext/bank-reconciliation)
- [Accounting Reports](https://docs.frappe.io/erpnext/accounting-reports)
- [General Ledger](https://docs.frappe.io/erpnext/general-ledger)

### Reckon Accounts product references

- [Reckon Accounts README](https://github.com/TechwithZakir/Reckon-Accounts/blob/main/README.md)
- [Reckon Accounts report catalog](https://github.com/TechwithZakir/Reckon-Accounts/blob/main/REPORT_CATALOG.md)
