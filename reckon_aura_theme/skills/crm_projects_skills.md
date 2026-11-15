# CRM and Projects support guide

ERPNext CRM records and the separate Frappe CRM app are related but are not
the same product or workflow. Check which app is installed and which page the
user is viewing before giving menu instructions.

## Leads and sales opportunities

- In ERPNext, a Lead represents a potential prospect; an Opportunity tracks a
  qualified sales possibility and can feed a Quotation.
- In the separate Frappe CRM app, the common flow is Lead → Deal, with
  contacts, organizations, notes, communications, and follow-up tasks around
  the customer conversation.
- Pipeline stages, assignment rules, forms, email, and visibility depend on
  each app's configuration and role permissions.
- When converting a record, review the target Customer/Organization and
  Contact, ownership, notes, and linked transactions before confirming.

Do not treat an ERPNext Opportunity and a Frappe CRM Deal as interchangeable.
Ask which app/page is in use if the user says only “CRM”.

## Projects and Tasks

- A Project groups work; Tasks describe assignable pieces of that work. Tasks
  may be created within a Project or independently.
- Project completion can be configured as manual or calculated from Task
  completion, progress, or weights. Explain the selected method before
  interpreting a percentage.
- Use expected dates, status, priority, assignees, and dependencies according
  to the team's process. Timesheets or billing links may depend on installed
  features and configuration.

## Troubleshooting

- **A lead/deal/project is missing:** check filters, owner/team visibility,
  permissions, status, and which app owns the record.
- **Project progress looks wrong:** inspect the Project's completion method
  and each linked Task's status, progress, and weight.
- **Follow-up is not visible:** check the linked record, assignee, due date,
  task status, and the user's access.
- **A conversion target differs:** verify whether the source is ERPNext CRM or
  Frappe CRM and review mapped records before creating duplicates.

## References

- [ERPNext Opportunity](https://docs.frappe.io/erpnext/opportunity)
- [ERPNext Project](https://docs.frappe.io/erpnext/project)
- [ERPNext Task](https://docs.frappe.io/erpnext/task)
- [First steps with Frappe CRM](https://docs.frappe.io/crm/setup-guide/your-first-steps-with-frappe-crm)
