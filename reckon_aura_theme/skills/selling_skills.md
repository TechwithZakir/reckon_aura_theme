# Selling support guide

Use this guide for ERPNext selling workflows. It describes standard behavior;
workspace names, permissions, and optional steps can vary by site.

## Choose the sales flow

- **Quotation → Sales Order → Delivery Note → Sales Invoice → Payment Entry** is a
  traceable order-to-cash flow. A Quotation is an offer; the Sales Order records
  the confirmed commitment.
- A **Delivery Note** records goods leaving a Warehouse and updates stock.
- A **Sales Invoice** bills the Customer and posts accounting entries. Use
  **Update Stock** only when the invoice itself should record the stock movement
  and a Delivery Note has not already recorded it.
- Service sales can omit stock delivery. Simple counter sales can use a direct
  Sales Invoice when the site's Selling Settings allow it.
- A Quotation may be created for a Lead or Customer and converted to a Sales
  Order after acceptance. Review the mapped items, rates, dates, and terms.

Use the shortest flow that provides the needed approval, fulfilment tracking,
and audit trail. Do not create a second stock movement for goods already
recorded by a Delivery Note or invoice.

## Before submitting

Confirm the Company, Customer, items, quantities, UOMs, rates, currency,
posting/delivery dates, source Warehouse, taxes, discounts, payment terms, and
shipping details. Check the Price List and Item Price when rates differ from
expectations. Submit only when the commercial agreement is confirmed.

## Troubleshooting

- **Order not available for delivery or invoicing:** check that it is submitted,
  has remaining quantities, and the next document is created from the order.
- **Stock not reduced:** confirm whether a submitted Delivery Note or a Sales
  Invoice with **Update Stock** is the intended stock transaction.
- **Wrong price or tax:** inspect the transaction date, currency, Price List,
  Item Price, Customer defaults, tax template, and applicable settings.
- **Order progress is unexpected:** compare linked and submitted downstream
  documents; direct documents may not update the originating order's progress
  unless linked.
- **Customer cannot see a document:** check the user's role and document
  permissions; do not infer access from the workspace.

## References

- [Selling module](https://docs.frappe.io/erpnext/selling)
- [Quotation](https://docs.frappe.io/erpnext/quotation)
- [Sales Order](https://docs.frappe.io/erpnext/sales-order)
- [Delivery Note](https://docs.frappe.io/erpnext/delivery-note)
- [Sales Invoice](https://docs.frappe.io/erpnext/sales-invoice)
- [Selling Settings](https://docs.frappe.io/erpnext/selling-settings)
