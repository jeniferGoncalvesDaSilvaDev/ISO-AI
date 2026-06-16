---
name: AI Routing (NVIDIA + OpenAI)
description: How callAI() routes between NVIDIA and OpenAI; no Gemini, no Llama models
---

## Rules
- Primary: NVIDIA `nvidia/nemotron-4-340b-instruct` via `https://integrate.api.nvidia.com/v1/chat/completions`
  - Key: `NVIDIA_API_KEY` env var (Replit Secret)
  - Timeout: 20s
- Fallback: OpenAI `gpt-4o-mini` via `https://api.openai.com/v1/chat/completions`
  - Key: `OPENAI_API_KEY` env var (Replit Secret)
  - Timeout: 30s
- No Gemini, no Llama models (user explicitly removed them)

**Why:** User requested NVIDIA as primary (lower latency) and OpenAI for slow internet fallback.

**How to apply:** If neither key is set, callAI() throws — callers must catch and use fallback templates. Chat endpoint shows a helpful error message when AI is unavailable.
