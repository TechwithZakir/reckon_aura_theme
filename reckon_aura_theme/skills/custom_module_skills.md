# Custom module support guide

Custom modules vary by installed app, version, and site configuration. No
specific custom module documentation has been supplied yet, so do not invent
its features, menu paths, workflow states, or permissions.

When a user asks about a custom feature:

1. Ask for the exact app/module name and, if known, its version.
2. Ask which page, DocType, report, or route they are using and what outcome
   they want.
3. If an error is involved, ask for the exact message and the steps that
   reproduce it. Remind the user to remove customer, employee, financial, and
   credential data from screenshots or logs.
4. Check whether the described feature belongs to standard ERPNext or the
   custom app. Use the custom app's own documentation as the authority for
   custom behavior.
5. If documentation is unavailable, state that limitation and give only
   verified standard Frappe/ERPNext guidance. Direct the user to their
   administrator/vendor for undocumented custom behavior.

Never ask for passwords, API keys, or unrestricted production data. Do not
claim that the assistant can inspect or change custom records unless a
permission-checked integration explicitly provides that ability.
