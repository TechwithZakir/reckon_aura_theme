# Working on Reckon Aura AI

- This app answers from `reckon_aura_theme/skills/*.md`. When any ReckonERP module (ReckonBooks, Reckon HRMS,
  Distribution, Reckon CRM, Sales AI Agent, Retail Loyalty, the account pages) is added or its behaviour, screens,
  errors, access rules or pricing change, **update its guide in the same change** and refresh its prompts. Read
  `reckon_aura_theme/skills/README.md` first.
- `tests/test_skills.py` fails when a product has no guide or a guide has no prompts.
- Internal names stay `reckon_aura_theme` and **Aura Theme Settings**; the product name is **Reckon Aura AI** and the
  assistant is **Ask Aura AI**.
