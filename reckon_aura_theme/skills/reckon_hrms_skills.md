# Reckon HRMS support guide

Reckon HRMS is HR, attendance, leave and payroll for one company, with two guided pages: **HR Studio** and
**Payroll Studio**, a Home page, biometric attendance and an app check-in. It builds on Frappe HR's engine. Frappe
HR remains authoritative for standard behaviour; payroll and statutory rules depend on local law and company policy
(not legal or tax advice).

## Where things are

Open Reckon HRMS from the Apps screen (`/desk/reckon-hrms`). Menu: Home, HR Studio, Payroll Studio, Dashboard,
People (Employee, Department, Designation, Branch, Employment Type, Employee Grade, Exit Interview, Office
Location), Time and Attendance (Check in/out, Attendance, Biometric Devices, Shift Type, Shift Assignment, Holiday
List, Holiday List Assignment), Leave and Expense (Leave Application, Leave Type, Leave Allocation, Leave Policy
Assignment, Leave Ledger Entry, Expense Claim, Expense Claim Type), Payroll (Payroll Entry, Salary Slip, Salary
Structure, Structure Assignment, Salary Component, Additional Salary, Income Tax Slab, Benefit Ledger), and HR and
Payroll reports.

## HR Studio (tabs, in order)

**Guided setup** (opens first until the company has an industry), Hiring, Company and employee setup, Onboarding, Employee details, Time and attendance, Leave and holidays, Exit.
Each tab lists the standard records with a list icon and an add icon. **Employee details** shows employee cards with
search, branch, department, status filters, group-by and a Create button (opens the new employee form).

## Guided setup and Ask AI

HR Studio and Payroll Studio each have a **Guided setup** tab and an **Ask AI** button in the page header. That button (and
**Ask AI to set it up for me**) starts the **setup agent** in this chat: it asks the interview questions one at a time, reads each
reply, shows the plan, and after the person says yes it sets everything up itself. When the agent is running, the person answers
its questions; do not write a how-to guide instead. The tab shows **Your
industry** with the **Current industry**; choosing an industry shows a **preview** of what will be pre-loaded (job titles,
departments, pay items, leave types, overtime rule) and what already exists, then **Set up for this industry** adds only the
missing items. Nothing is paid and no amounts or leave days are set. The tab opens with **Your setup**: every step with what it holds and a
**Review / edit** link to its own page (or **Set up now** when empty). The interview is pre-filled with what the company already has
and each question links to the page that edits it; skipping keeps what exists. Below the industry the **Setup interview** asks one question at a time (country, language, locations,
departments, job titles, weekly off days, public holidays, working hours, leave days per year, salary structure percentages);
**Ask AI to prepare my setup** builds one plan to review (green = will be added, orange = needs attention), and **Set everything
up** runs it for the signed-in company only. Empty answers are skipped; Ask AI only reads free text such as a holiday list and
never makes up amounts, dates or leave days. Leave days become a Leave Policy that employees get when it is assigned to them.
The company's industry is in the question context as `industry`; use the HR
industry guide for what each industry loads and how to guide the person one step at a time.

## Setup order for a new company

1. Offices (Branch), Departments, Job titles (Designation), Levels (Employee Grade), Types (Employment Type).
2. Holiday List for the year (the company's default holiday list is used for new employees).
3. Leave Types, then Leave Allocations per employee.
4. Employees (a new employee automatically gets a Holiday List Assignment).
5. Salary Components (pay items), a Salary Structure, then Structure Assignments. In Payroll Studio > Salary rules
   the bulk button gives a structure to everyone without one; its start date should be the **1st of the month** so
   that month's salary can run.

**When everyone is paid a different gross:** keep one Salary Structure of percentages and fixed items (the shape of pay); the
person's gross is the **base** on their own Structure Assignment. Several structures may be in use at once, each person with their own
gross. For new staff, the employee import has optional `gross_salary` and `salary_structure` columns (structure is required when the
company has more than one). For existing staff, Payroll Studio > Salary rules > "Each person's gross salary" lists active people with a
structure and gross each; save changed rows or load a CSV (`employee`, `gross`, optional `structure`). A raise is a new assignment from
its date, so old slips stay. The bulk card is only for people paid the same. Monthly extras use Additional Salary.

## Payroll Studio: run salary in five steps (Run salary tab)

Tabs: **Guided setup**, Salary rules, Run salary. Payroll's Guided setup is the salary process in HRMS order: employees, holidays, attendance and leave
(set in HR Studio: shown as status with a link, never asked again), then payroll payable account, pay items, salary structure, the late and early
deduction rule (editable inline), structure given to people, and Run salary. Ask AI there (`start payroll`) asks only two questions: the salary
structure (name, basic %, house rent %, medical, conveyance) and the deduction rule (every N marks = 1 day, pay / divisor, optional cap).

1 Choose month and people (Find employees). 2 Check the list (who has no structure is flagged). 3 Make draft slips.
4 Review and approve (submits slips; the approval asks for confirmation). 5 Pay: pick the cash or bank account,
type a reference, record payment (one journal entry; each employee is named on the payable account). Held payments
are left out; bank and wallet CSV sheets are available. Nothing is paid before step 5.

## Common problems and fixes

- **"No Holiday List was found for Employee":** create or submit a Holiday List Assignment for the employee.
- **"Please assign a Salary Structure ... applicable from or before <first day>":** the structure assignment starts
  after the period start; add one dated on or before the 1st (or change the period).
- **0 draft slips made:** the page now shows the reason; fix it and run Create draft slips again.
- **"Please set account in Salary Component" / unknown account:** the first slip adds the company's expense or
  payable account to each pay item; resubmit the slip.
- **"Account type should be set Payable for payroll payable account":** the company's payroll payable account must be
  of type Payable (setup does this).
- **Leave application blocked:** check Leave Allocation, Leave Type, the approver and the holiday list.
- **Provident Fund report errors:** the India-specific provident fund report is not offered; use Salary Register.
- **Employee Advance Summary missing:** requires the Employee Advance record type, which is not part of the plan.

## Company separation

Employees, departments, attendance, leave, salary slips and payroll runs belong to one company. Designations,
Leave Types, Salary Components, Branches and similar lists have vendor rows (read-only) plus the company's own.
HR Settings and Payroll Settings are read-only for companies.

## Copilot ideas

Explain a salary slip line by line, check why an employee has no balance, draft a leave policy, suggest the right
reports for a monthly HR review, prepare a payroll run checklist, translate a policy into Bangla.

## Autopilot limits

Aura does not run payroll. The Studio's batch steps (draft slips, approve) run after a person clicks. Schedule a
monthly reminder for the payroll checklist; keep approval and payment with HR and accounts.

## Links

Menu names that become links in Ask Aura AI answers (label | address). Keep these in step with the menus.

- Reckon HRMS | /desk/reckon-hrms
- HR Studio | /desk/reckon-hrms/reckon-hrms-hr-studio
- Payroll Studio | /desk/reckon-hrms/reckon-hrms-setup
- Dashboard | /desk/reckon-hrms/reckon-hrms-home
- Employee | /desk/reckon-hrms/employee
- Department | /desk/reckon-hrms/department
- Designation | /desk/reckon-hrms/designation
- Branch | /desk/reckon-hrms/branch
- Employment Type | /desk/reckon-hrms/employment-type
- Employee Grade | /desk/reckon-hrms/employee-grade
- Exit Interview | /desk/reckon-hrms/exit-interview
- Check in/out | /desk/reckon-hrms/reckon-hrms-checkin
- Time and Attendance | /desk/reckon-hrms/attendance
- Attendance | /desk/reckon-hrms/attendance
- Biometric Devices | /desk/reckon-hrms/hrms-attendance-device
- Shift Type | /desk/reckon-hrms/shift-type
- Shift Assignment | /desk/reckon-hrms/shift-assignment
- Holiday List Assignment | /desk/reckon-hrms/holiday-list-assignment
- Holiday List | /desk/reckon-hrms/holiday-list
- Leave Application | /desk/reckon-hrms/leave-application
- Leave Type | /desk/reckon-hrms/leave-type
- Leave Allocation | /desk/reckon-hrms/leave-allocation
- Leave Policy Assignment | /desk/reckon-hrms/leave-policy-assignment
- Leave Ledger Entry | /desk/reckon-hrms/leave-ledger-entry
- Expense Claim | /desk/reckon-hrms/expense-claim
- Payroll Entry | /desk/reckon-hrms/payroll-entry
- Salary Slip | /desk/reckon-hrms/salary-slip
- Salary Structure Assignment | /desk/reckon-hrms/salary-structure-assignment
- Salary Structure | /desk/reckon-hrms/salary-structure
- Salary Component | /desk/reckon-hrms/salary-component
- Additional Salary | /desk/reckon-hrms/additional-salary
- Income Tax Slab | /desk/reckon-hrms/income-tax-slab
- Salary Register | /desk/reckon-hrms/query-report/Salary Register

## Prompts to try

- How do I run this month's salary in Payroll Studio, step by step?
- Why can't I create a leave application for this employee?
- How do I set up shifts and biometric attendance?
- What should I check before submitting salary slips?
- How do I add a new employee and give them leave?
- Why did the payroll run say no salary structure?
- How do I record attendance for a day I missed?
- Explain this salary slip to the employee in simple words.
- How do I start HR setup for a new company?

## Prompts to try (Bangla)

- Payroll Studio-তে কীভাবে এই মাসের বেতন চালাব?
- নতুন কর্মী যোগ করে কীভাবে ছুটি বরাদ্দ করব?
- আমার এই কর্মীর বেতন স্লিপ কেন তৈরি হচ্ছে না?
- বায়োমেট্রিক হাজিরা কীভাবে চালু করব?
