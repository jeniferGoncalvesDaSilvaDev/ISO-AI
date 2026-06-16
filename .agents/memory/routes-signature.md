---
name: routes.ts function signature
description: registerRoutes takes (httpServer, app) in that order
---

## Rule
`registerRoutes(httpServer: Server, app: Express): Promise<Server>`

**Why:** `server/index.ts` creates httpServer externally and passes it along with app. If you write `registerRoutes(app)` only, it breaks at runtime with "app.post is not a function".

**How to apply:** Always match the signature in index.ts: `await registerRoutes(httpServer, app)`.
