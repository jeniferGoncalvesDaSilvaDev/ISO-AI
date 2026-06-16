---
name: Documents table schema
description: documents table has section column for folder grouping
---

## Rule
`documents` table has `section text NOT NULL DEFAULT 'Geral'` column.
This was added via `npx drizzle-kit push` after updating `shared/schema.ts`.

**Why:** Needed to group documents into folders in the UI (like "1. Estrutura do SGQ", "2. Procedimentos", etc.) matching a real SGQ structure.

**How to apply:** When saving docs, always pass `section` field. Frontend groups by section to show folder structure. Storage interface includes `deleteDocumentsByCompany(companyId)` to wipe old docs before regenerating.
