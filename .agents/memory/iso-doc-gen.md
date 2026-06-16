---
name: ISO Document Generation
description: How comprehensive ISO documents are generated without requiring AI
---

## Approach
`server/iso-templates.ts` exports `buildDocumentSet(company, isoList)` which returns 10-15 documents per ISO norm, each with `{section, type, content}`.

**Why:** AI models (Gemini, NVIDIA, OpenAI) can all be unavailable. Templates ensure the platform always works. AI is optional enhancement only.

**How to apply:** When generating documents, always call `buildDocumentSet` first, then optionally enhance with AI. Never block generation on AI availability.

## Structure per ISO
- ISO 9001: 13 docs (Estrutura, Procedimentos, Formulários, Plano)
- ISO 27001: 6 docs (Estrutura SGSI, Gestão Riscos, Procedimentos, Plano)
- ISO 14001: 3 docs (Estrutura, Aspectos, Plano)
- ISO 45001: 3 docs (Política, Riscos, Plano)
- Other ISOs: 2 generic docs (Política + Plano)

## Key flow
1. `DELETE` old docs via `deleteDocumentsByCompany(companyId)`
2. `buildDocumentSet(company, isoList)` → array of template docs
3. Optional AI enhancement (wraps only first 2 docs, doesn't block)
4. Save all to DB with `section` field
