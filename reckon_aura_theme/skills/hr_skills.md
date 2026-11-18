# HR and payroll support guide

> **ReckonERP customers use Reckon HRMS** with HR Studio and Payroll Studio. Its flows and fixes are in the Reckon HRMS
> guide; this guide covers standard Frappe HR concepts.

Frappe HR (formerly HRMS) is a separate app from ERPNext. Confirm that it is
installed and that the user's role permits access before describing a page or
workflow as available. HR and payroll rules also depend on local law and
company policy; this guide is not legal or tax advice.

## Employee and leave workflows

- Keep the Employee record and employment details current; access to personal
  data must follow the site's HR roles and permissions.
- Leave availability depends on Leave Type, Leave Period, policy/assignment,
  Holiday List, and Leave Allocation. Check these before troubleshooting a
  balance.
- An Employee submits a Leave Application for approval by the configured
  approver. A request is not an approved absence until its workflow is
  complete.
- Attendance may come from manual attendance, Employee Checkin, or configured
  integrations. Confirm the site's process and date before correcting a
  record.

## Payroll overview

1. Configure Salary Components and a Salary Structure for the applicable
   Company and employees.
2. Create Salary Structure Assignments with effective dates.
3. Configure Payroll Period or tax settings when required by the site.
4. Use Payroll Entry to generate and review Salary Slips for the intended
   period.
5. Check attendance/leave without pay, earnings, deductions, payment days,
   currency, and payroll accounts before submitting or booking payroll.

Payroll configuration and deductions are jurisdiction-specific. Direct
calculation or compliance questions to the responsible HR/payroll professional.

## Troubleshooting

- **No leave balance:** check the Leave Period, Leave Policy Assignment,
  Leave Allocation, effective dates, and submitted Leave Ledger Entries.
- **Leave request cannot be approved:** verify the configured approver,
  workflow state, leave balance, holidays, and user permissions.
- **Salary Slip is missing or incorrect:** check the Salary Structure
  Assignment dates, payroll period, salary components, attendance, LWP
  settings, and linked payroll documents.
- **A menu is missing:** verify the Frappe HR app is installed and the
  employee's HR role has permission; do not assume every ERPNext site has
  payroll enabled.

## References

- [Frappe HR introduction](https://docs.frappe.io/hr/introduction)
- [Leaves](https://docs.frappe.io/hr/leaves)
- [Payroll Setup](https://docs.frappe.io/hr/payroll-setup)
- [Attendance](https://docs.frappe.io/hr/attendance)
- [Employee](https://docs.frappe.io/hr/employee)
