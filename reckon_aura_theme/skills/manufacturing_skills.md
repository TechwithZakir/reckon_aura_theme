# Manufacturing support guide

Use this guide for standard ERPNext production workflows. Operations, quality
checks, planning rules, and warehouse requirements depend on the site's setup.

## Production setup

- An Item represents the product or component; its stock settings affect
  inventory transactions.
- A Bill of Materials (BOM) lists materials, quantities, and optionally
  operations for a manufactured Item. ERPNext supports multi-level BOMs.
- Operations, Workstations, and Routing describe production steps when the
  process tracks operations.
- Review a BOM carefully before submitting. Submitted BOMs are not edited in
  place; changes normally require a replacement/versioned BOM using the site's
  configured process.

## Work Order flow

1. Create a Work Order for the manufactured Item and quantity, using the
   intended submitted BOM.
2. Review required materials, operations, source Warehouses, Work-in-Progress
   Warehouse, target Warehouse, and planned dates.
3. Submit the Work Order after required Warehouses and materials are correct.
4. Transfer or consume materials and track operations with Job Cards if those
   steps are part of the site's process.
5. Record completed goods and any scrap/by-products through the configured
   manufacturing transaction. Verify the resulting stock and accounting
   records.

Work Orders may be created from a Production Plan or Sales Order. Do not assume
that a Work Order alone has moved stock or completed production; inspect its
linked Stock Entries and Job Cards.

## Troubleshooting

- **Required materials are missing:** check the active BOM, quantity,
  multi-level BOM setting, material rows, and source Warehouses.
- **Work Order cannot be submitted:** review mandatory Warehouses, BOM status,
  Item settings, dates, and permissions.
- **Production quantity or cost differs:** inspect material transfers and
  consumption, operation/job-card progress, scrap, and the linked stock
  transactions before changing the BOM.
- **A planning feature is unavailable:** confirm the installed ERPNext version
  and configuration; optional planning/quality features may not be enabled.

## References

- [Manufacturing module](https://docs.frappe.io/erpnext/manufacturing)
- [Bill of Materials](https://docs.frappe.io/erpnext/bill-of-materials)
- [Work Order](https://docs.frappe.io/erpnext/work-order)
- [Job Card](https://docs.frappe.io/erpnext/job-card)
- [Production Plan](https://docs.frappe.io/erpnext/production-plan)
- [Stock Entry](https://docs.frappe.io/erpnext/stock-entry)
