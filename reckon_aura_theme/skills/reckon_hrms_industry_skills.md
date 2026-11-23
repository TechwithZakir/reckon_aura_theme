# Reckon HRMS industry guides (guided setup)

Use this guide with the Reckon HRMS guide when someone sets up **HR Studio** or **Payroll Studio**, or asks what an industry
loads. The company's chosen industry is shown in the question context as `industry` (for example `manufacturing_rmg_textile`).
Everything below is a starter assumption: the company confirms every item, pay amounts stay theirs, and none of this is legal
or tax advice.

## How the guided setup works

HR Studio > **Guided setup** tab has a section **Your industry** with **Current industry**. Choosing an industry first shows a **preview**
of what will be loaded and what already exists; **Set up for this industry** then adds only what is missing. Repeating it is safe.
It adds job titles (Designation), departments, salary components (and their accounts), leave types and, where the industry uses
overtime, the Overtime Type 'Standard Overtime'. It does **not** create salary amounts, salary structures, leave days, employees or
payments. Payroll Studio > **Guided setup** is a payroll checklist and asks no HR questions. Both tabs have **Ask AI** buttons
that open this assistant with the question already filled in.

When someone asks for help with setup, ask the interview questions one at a time and in this order, say what each answer will
create, and tell them to type the answers into the **Setup interview** on the Guided setup tab, then press **Ask AI to prepare
my setup** and review the plan before **Set everything up**. The interview is a stepper that asks one question at a time, in this
order: country (the usual weekly off follows it, and the person confirms), language (English or Bangla; answer in it), locations
(offices, factories or sites, which become Branches), departments, job titles, weekly off days, public holidays (date and name, one per
line), working hours (shift name, start, end, late grace), leave days per year (casual, sick, earned, maternity), and the salary structure
(Basic % of gross, house rent % of gross, medical and conveyance as fixed monthly amounts). Each step can be skipped. Never suggest
numbers for them; ask the company's policy.

When data already exists the agent shows it ("Now: ...") and the page that edits it (Branch, Department, Designation, Holiday List,
Shift Type, Leave Policy, Salary Structure); skipping keeps it. The agent only adds: to change something that exists, send the person
to that page.

Guide the person one step at a time and ask what they have done before moving on:

1. Choose the industry (preview, then Set up for this industry). If the industry is not chosen yet, ask what the company does and name the closest one.
2. Departments and job titles: keep the starter ones that fit, add the company's own (HR Studio > Company and employee setup).
3. Holiday List for the year, then Leave Types and Leave Allocations (days come from the company's own policy).
4. Shifts and attendance: Shift Type, Shift Assignment, and devices or app check-in.
5. Pay items: confirm the starter Salary Components, then make a Salary Structure with amounts and give it to people (Payroll Studio > Salary rules).
6. Add employees (template upload or one by one), then Payroll Studio > Run salary: draft slips, review, approve, pay.

The agent reads sentences and answers a short mid-interview question, then re-asks. Never invent a percentage, rate or leave day count. If the company has not decided, say so and offer to note the question for HR.

## How the setup agent works (so you never write a how-to instead)

Setup is done by the **setup agent**, a chat assistant that runs inside this chat. A request to set up, configure, choose an
industry or see what is pre-loaded starts it by itself; the Ask AI buttons start it too. The agent (not you) asks the questions one
at a time, reads the person's reply, repeats it in words, and at the end shows the plan; only a "yes" makes it create anything,
and it does so for the signed-in company only. If you are asked a setup question and no agent has started, say in one line that
you will start the setup chat, and do not list the steps. Questions about what something means (for example "what is house
rent allowance?") are answered normally; the person can say `cancel` to leave the agent.

## Industries

### IT / Software (`it_software`)

- Departments loaded: Engineering, Quality Assurance, Product, Support, Sales, Human Resources, Finance.
- Job titles loaded: Help Desk / IT Support, Junior Software Developer, Software Engineer, Senior Software Engineer, AI / Data Engineer, DevOps / Cloud Engineer, IT Project Manager, QA / Test Engineer.
- Pay items loaded: Basic Salary, House Rent Allowance, Medical Allowance, Conveyance Allowance; plus Mobile Allowance, Attendance Incentive, Performance Bonus, Festival Bonus, Overtime. Recovery items: Loan Recovery, Salary Advance Recovery, Other Adjustment.
- Leave types loaded: Casual Leave, Sick Leave, Earned Leave, Unpaid Leave, Maternity Leave, Compensatory Off (no days are given).
- Focus: Hybrid and remote work is common, so use the app check-in (Employee Checkin) or geo check-in for attendance, and keep shifts flexible. Pay usually mixes fixed items with Performance Bonus and an optional Attendance Incentive.
- Watch: Mobile Allowance is a flat or claimed amount; set a cap if the company reimburses actual bills. Overtime is loaded but many software companies do not pay it: leave it unused if so.

### Manufacturing / RMG / Textile (`manufacturing_rmg_textile`)

- Departments loaded: Production, Quality, Merchandising, Store, Human Resources, Accounts.
- Job titles loaded: Machine Operator (skilled), Production Supervisor, Factory Manager, Quality / QA Executive.
- Pay items loaded: Basic Salary, House Rent Allowance, Medical Allowance, Conveyance Allowance; plus Meal Allowance, Attendance Incentive, Shift Allowance, Festival Bonus, Overtime. Recovery items: Loan Recovery, Salary Advance Recovery, Other Adjustment.
- Leave types loaded: Casual Leave, Sick Leave, Earned Leave, Unpaid Leave, Maternity Leave, Compensatory Off (no days are given).
- Focus: Factories run shifts and weekly-off rosters, so set up Shift Type and Shift Assignment first and connect biometric devices (Biometric Devices) so punches become attendance.
- Watch: Overtime (Overtime Type 'Standard Overtime', starting multiplier 2.0) and Attendance Incentive depend on attendance records; Festival Bonus is entered per occasion. Confirm each rule with the company's policy before the first run.

### Construction / Engineering (`construction_engineering`)

- Departments loaded: Project Management, Site Operations, Engineering, Procurement, Accounts, Human Resources.
- Job titles loaded: Civil Engineer, Site Supervisor, Skilled Technician.
- Pay items loaded: Basic Salary, House Rent Allowance, Medical Allowance, Conveyance Allowance; plus Meal Allowance, Site Allowance, Shift Allowance, Festival Bonus, Overtime. Recovery items: Loan Recovery, Salary Advance Recovery, Other Adjustment.
- Leave types loaded: Casual Leave, Sick Leave, Earned Leave, Unpaid Leave, Maternity Leave, Compensatory Off (no days are given).
- Focus: People work across sites. Use geo check-in for site attendance and Site Allowance for days worked at a site; keep head-office staff and site staff on separate Salary Structures if their pay items differ.
- Watch: Site Allowance and Shift Allowance depend on days or shifts worked: decide whether they are a fixed amount or a rate times days, then enter them with Additional Salary or the structure formula.

### Corporate / Finance (`corporate_finance`)

- Departments loaded: Finance, Accounts, Human Resources, Operations, Administration.
- Job titles loaded: Accountant / Finance Executive, HR Executive, HR Manager.
- Pay items loaded: Basic Salary, House Rent Allowance, Medical Allowance, Conveyance Allowance; plus Mobile Allowance, Performance Bonus, Festival Bonus, Overtime. Recovery items: Loan Recovery, Salary Advance Recovery, Other Adjustment.
- Leave types loaded: Casual Leave, Sick Leave, Earned Leave, Unpaid Leave, Maternity Leave, Compensatory Off (no days are given).
- Focus: A plain structure works for most offices: fixed pay items plus Performance Bonus and Festival Bonus. Fixed office hours mean one general Shift Type is usually enough.
- Watch: Keep review dates for Performance Bonus (quarterly or annual) in HR's calendar and enter approved amounts through Additional Salary.

### Sales / Marketing (`sales_marketing`)

- Departments loaded: Sales, Marketing, Key Accounts, Human Resources, Accounts.
- Job titles loaded: Sales Executive, Marketing Manager.
- Pay items loaded: Basic Salary, House Rent Allowance, Medical Allowance, Conveyance Allowance; plus Mobile Allowance, Sales Commission, Performance Bonus, Festival Bonus. Recovery items: Loan Recovery, Salary Advance Recovery, Other Adjustment.
- Leave types loaded: Casual Leave, Sick Leave, Earned Leave, Unpaid Leave, Maternity Leave, Compensatory Off (no days are given).
- Focus: Field teams need geo check-in or visit-based attendance, and a clear rule for Sales Commission (target, slab, or collection based).
- Watch: Commission is variable, so keep it out of the fixed structure: enter the approved amount each month with Additional Salary. Payroll Studio's run shows it as a pay item on the slip.

### Pharmaceuticals (`pharmaceuticals`)

- Departments loaded: Production, Quality Assurance, Sales, Regulatory, Human Resources, Accounts.
- Job titles loaded: Medical / Product Sales Representative, Production / QA Executive.
- Pay items loaded: Basic Salary, House Rent Allowance, Medical Allowance, Conveyance Allowance; plus Meal Allowance, Sales Commission, Performance Bonus, Festival Bonus, Overtime. Recovery items: Loan Recovery, Salary Advance Recovery, Other Adjustment.
- Leave types loaded: Casual Leave, Sick Leave, Earned Leave, Unpaid Leave, Maternity Leave, Compensatory Off (no days are given).
- Focus: Plants run production and QA shifts, while medical and product sales representatives work in the field. Treat them as two groups with their own Salary Structure.
- Watch: TA/DA and incentive plans vary by company: model them as Sales Commission or Performance Bonus entries, or as expense claims, and confirm the rule with the company. Overtime applies to plant roles only.

### Trading / Distribution (`trading_distribution`)

- Departments loaded: Sales and Distribution, Warehouse, Accounts, Procurement, Human Resources.
- Job titles loaded: Sales / Territory Officer, Warehouse / Inventory Executive.
- Pay items loaded: Basic Salary, House Rent Allowance, Medical Allowance, Conveyance Allowance; plus Meal Allowance, Sales Commission, Shift Allowance, Festival Bonus, Overtime. Recovery items: Loan Recovery, Salary Advance Recovery, Other Adjustment.
- Leave types loaded: Casual Leave, Sick Leave, Earned Leave, Unpaid Leave, Maternity Leave, Compensatory Off (no days are given).
- Focus: Sales and territory officers need commission and field attendance; warehouse staff need shifts. Reckon Distribution (SR and DSR) can hold the sales side, and HR holds the people and pay.
- Watch: Sales Commission is entered per run with Additional Salary. Warehouse overtime and Shift Allowance follow approved attendance.

### Healthcare (`healthcare`)

- Departments loaded: Clinical, Administration, Billing and Accounts, Human Resources, Support Services.
- Job titles loaded: Hospital Admin Executive, Accounts / Billing Executive.
- Pay items loaded: Basic Salary, House Rent Allowance, Medical Allowance, Conveyance Allowance; plus Meal Allowance, Shift Allowance, Festival Bonus, Overtime. Recovery items: Loan Recovery, Salary Advance Recovery, Other Adjustment.
- Leave types loaded: Casual Leave, Sick Leave, Earned Leave, Unpaid Leave, Maternity Leave, Compensatory Off (no days are given).
- Focus: Clinical and support staff work rosters with night and weekend duty. Set up Shift Type for each duty pattern and Shift Assignment per period before attendance.
- Watch: Shift Allowance and Overtime follow the duty roster, and hospital size changes pay. Confirm eligibility with the hospital's policy.

### Education / NGO / Services (`education_ngo_services`)

- Departments loaded: Academic, Programmes, Administration, Finance, Human Resources.
- Job titles loaded: Program / Admin Officer.
- Pay items loaded: Basic Salary, House Rent Allowance, Medical Allowance, Conveyance Allowance; plus Mobile Allowance, Performance Bonus, Festival Bonus. Recovery items: Loan Recovery, Salary Advance Recovery, Other Adjustment.
- Leave types loaded: Casual Leave, Sick Leave, Earned Leave, Unpaid Leave, Maternity Leave, Compensatory Off (no days are given).
- Focus: Academic and programme staff follow term or project calendars. Set the Holiday List to the institution's calendar and use Leave Types for term breaks and project leave.
- Watch: Donor-funded roles may be paid differently from market bands, so use a salary suggestion only as a reference. No Overtime component is loaded for this industry.

### Retail / Logistics (`retail_logistics`)

- Departments loaded: Store Operations, Logistics, Warehouse, Procurement, Human Resources, Accounts.
- Job titles loaded: Store / Operations Supervisor.
- Pay items loaded: Basic Salary, House Rent Allowance, Medical Allowance, Conveyance Allowance; plus Meal Allowance, Shift Allowance, Attendance Incentive, Festival Bonus, Overtime. Recovery items: Loan Recovery, Salary Advance Recovery, Other Adjustment.
- Leave types loaded: Casual Leave, Sick Leave, Earned Leave, Unpaid Leave, Maternity Leave, Compensatory Off (no days are given).
- Focus: Stores and warehouses run shifts and weekly rosters. Set up Shift Type and Shift Assignment, then use Attendance Incentive and Shift Allowance as the company's policy requires.
- Watch: Overtime follows approved attendance; Festival Bonus is entered per occasion. Keep store staff and logistics staff on separate structures if their pay items differ.

## Common questions

- **Will setting up an industry change my existing data?** No. It only adds what is missing, and a name that already exists is left as it is.
- **Does it pay anyone or set salaries?** No. Amounts, structures and payments are always the company's step.
- **Can I change the industry later?** Yes: choose another and set it up; the first industry's items stay unless you remove them.
- **A pay item was not added (code already used):** another item already has that short code; keep the existing one or rename it.
- **Payroll approval says an account is missing for a pay item:** open the Salary Component, add this company's account, or run Set up for this industry again.
- **Who can do this?** HR Manager (and System Manager). Payroll Manager can view the industry and salary suggestions.

## Links

- HR Studio | /desk/reckon-hrms/reckon-hrms-hr-studio
- Payroll Studio | /desk/reckon-hrms/reckon-hrms-setup

## Prompts to try

- Guide me through setting up HR for my industry, step by step.
- What will be pre-loaded if I choose my industry in HR Studio?
- Which pay items does my industry load, and which should I use?
- How should I set up shifts and attendance for my industry?
- Help me design a salary structure for my industry without guessing amounts.
- What should I check before my first payroll run?

## Prompts to try (Bangla)

- আমার কোম্পানির জন্য শিল্প (industry) বেছে HR সেটআপ ধাপে ধাপে বুঝিয়ে দিন।
- ইন্ডাস্ট্রি সেট করলে কোন কোন ডেটা আগে থেকে লোড হবে?
- এই ইন্ডাস্ট্রির জন্য বেতন কাঠামো (Salary Structure) কীভাবে বানাব?
