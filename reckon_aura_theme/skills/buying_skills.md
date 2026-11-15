# Buying and procurement support guide

Use this guide for standard ERPNext purchasing. Supplier approvals, mandatory
documents, and matching tolerances depend on site configuration.

## Choose the buying flow

- **Material Request → Request for Quotation → Supplier Quotation → Purchase
  Order → Purchase Receipt → Purchase Invoice → Payment Entry** provides a
  detailed procurement and audit trail. Planning and quotation steps are
  optional.
- A **Purchase Order** records the commitment to a Supplier. Submitting it does
  not receive stock or create a General Ledger entry.
- A **Purchase Receipt** records goods physically received. For stock items it
  updates inventory; with perpetual inventory it also creates the related
  stock accounting entry.
- A **Purchase Invoice** records the supplier bill and payable. A **Payment
  Entry** records settlement.
- For a direct goods purchase, a Purchase Invoice with **Update Stock** can
  combine receipt and billing if the site permits it. Do not use it when a
  Purchase Receipt already recorded the same goods.
- For services and non-stock purchases, a Purchase Receipt is normally not
  needed.

Use Purchase Order, Purchase Receipt, and Purchase Invoice together when the
business needs ordered/received/billed quantity checks or separate warehouse
and finance approval.

## Before submitting

Confirm the Company, Supplier, items, quantities, UOMs, rates, currency,
delivery dates, target Warehouse, taxes, payment terms, and applicable
discounts. Review the source documents and received/billed quantities. Use
Quality Inspection or subcontracting only when configured and appropriate.

## Troubleshooting

- **Receipt or invoice quantities do not match the order:** compare ordered,
  received, and billed quantities and check for partial deliveries or
  unlinked documents.
- **Stock is duplicated:** check whether a Purchase Receipt and a Purchase
  Invoice with **Update Stock** both recorded the same goods.
- **Supplier balance is unexpected:** inspect the submitted Purchase Invoice,
  its payable account, taxes, outstanding amount, and linked Payment Entries.
- **A service purchase asks for a Warehouse:** verify that the Item is
  configured as non-stock and review the site's document settings.
- **A buying step is unavailable:** check Buying Settings, permissions, and
  whether the preceding transaction is submitted.

## References

- [Buying module](https://docs.frappe.io/erpnext/buying)
- [Material Request](https://docs.frappe.io/erpnext/material-request)
- [Request for Quotation](https://docs.frappe.io/erpnext/request-for-quotation)
- [Purchase Order](https://docs.frappe.io/erpnext/purchase-order)
- [Purchase Receipt](https://docs.frappe.io/erpnext/purchase-receipt)
- [Purchase Invoice](https://docs.frappe.io/erpnext/purchase-invoice)
- [Subcontracting](https://docs.frappe.io/erpnext/subcontracting)
