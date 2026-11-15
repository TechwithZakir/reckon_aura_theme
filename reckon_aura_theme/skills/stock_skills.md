# Stock and inventory support guide

Use this guide for ERPNext inventory and Warehouse workflows. Stock balances
depend on submitted transactions, posting date/time, item settings, and
valuation configuration.

## Core concepts

- An Item with **Maintain Stock** enabled participates in inventory tracking.
- A Warehouse identifies where stock is held. Use the correct company,
  Warehouse, UOM, batch, and serial details for each transaction.
- **Stock Entry** records movements such as Material Issue, Material Receipt,
  Material Transfer, Repack, or manufacturing-related transfer/consumption.
- Purchase Receipts and Delivery Notes also record stock movements as part of
  their respective buying and selling flows.
- **Stock Reconciliation** sets book quantity/value to a counted or opening
  balance. It is not a substitute for recording an ordinary receipt, issue, or
  transfer.

## Safe stock-count workflow

1. Select the correct Company, posting date/time, Item, and Warehouse.
2. Count physical stock and check UOM, serial numbers, batches, and any
   warehouse/bin scope.
3. Use **Opening Stock** for initial balances or **Stock Reconciliation** to
   adjust book stock to a verified physical count.
4. Review the difference account and valuation rate, then save and submit only
   after the count and accounting treatment are approved.
5. Verify the resulting balance in the Stock Ledger and relevant stock
   balance/valuation report.

For an internal transfer, use a Stock Entry with **Material Transfer** and
check both source and target Warehouses. For production movements, use the
Work Order/Job Card flow when configured rather than making an unrelated
manual movement.

## Troubleshooting

- **Unexpected balance:** inspect the Stock Ledger using the same Item,
  Warehouse, and posting date/time; review submitted receipts, deliveries,
  Stock Entries, reconciliations, and cancellations.
- **Cannot submit a movement:** check Item stock settings, Warehouse, UOM,
  quantity, batch/serial requirements, and user permissions.
- **Valuation differs:** review the transaction sequence and valuation
  configuration with the inventory/accounting administrator. Do not guess or
  force a rate to make reports match.
- **Stock appears in another Warehouse:** check source/target Warehouses and
  linked documents; a group Warehouse and its child Warehouses may be reported
  differently.

## References

- [Stock module](https://docs.frappe.io/erpnext/stock)
- [Stock Entry](https://docs.frappe.io/erpnext/stock-entry)
- [Stock Reconciliation](https://docs.frappe.io/erpnext/stock-reconciliation)
- [Item](https://docs.frappe.io/erpnext/item)
- [Warehouse](https://docs.frappe.io/erpnext/warehouse)
- [Stock Ledger Report](https://docs.frappe.io/erpnext/stock-ledger)
