import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import crypto from "crypto";
import { buildDocumentSet } from "./iso-templates";

// ── IA: NVIDIA (primário) → OpenAI (fallback) ──────────────────────────────
async function callAI(prompt: string): Promise<string> {
  // 1. NVIDIA Nemotron (sem modelos Llama)
  if (process.env.NVIDIA_API_KEY) {
    try {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-4-340b-instruct",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 4096,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) {
        const data = await res.json() as any;
        const text = data?.choices?.[0]?.message?.content || "";
        if (text) return text;
      } else {
        console.warn("NVIDIA falhou:", res.status);
      }
    } catch (e: any) {
      console.warn("NVIDIA timeout/erro:", e.message);
    }
  }

  // 2. OpenAI GPT-4o-mini (fallback para internet lenta)
  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 4096,
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (res.ok) {
        const data = await res.json() as any;
        const text = data?.choices?.[0]?.message?.content || "";
        if (text) return text;
      } else {
        console.warn("OpenAI falhou:", res.status);
      }
    } catch (e: any) {
      console.warn("OpenAI timeout/erro:", e.message);
    }
  }

  throw new Error("Nenhuma IA configurada. Adicione NVIDIA_API_KEY ou OPENAI_API_KEY em Secrets.");
}

function recommendIsos(sector: string): string[] {
  const s = sector.toLowerCase();
  if (s.includes("software") || s.includes("tecnologia") || s.includes("tech")) return ["ISO 27001", "ISO 9001"];
  if (s.includes("aliment") || s.includes("food") || s.includes("restaurante")) return ["ISO 22000", "ISO 9001"];
  if (s.includes("saúde") || s.includes("hospital") || s.includes("médic")) return ["ISO 9001", "ISO 13485", "ISO 45001"];
  if (s.includes("constru") || s.includes("obra") || s.includes("civil")) return ["ISO 9001", "ISO 14001", "ISO 45001"];
  if (s.includes("ambiental") || s.includes("sustenta") || s.includes("reciclagem")) return ["ISO 14001", "ISO 9001"];
  if (s.includes("manufat") || s.includes("indústr") || s.includes("produção")) return ["ISO 9001", "ISO 45001", "ISO 14001"];
  return ["ISO 9001"];
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // REGISTER - POST /api/auth/register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Este email já está registrado" });
      }
      const hashedPassword = crypto.createHash("sha256").update(password + email).digest("hex");
      const user = await storage.createUser({ email, password: hashedPassword });
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");
      res.json({ token, userId: user.id, email: user.email });
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ message: "Erro ao registrar usuário" });
    }
  });

  // LOGIN - POST /api/auth/login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) return res.status(401).json({ message: "Email ou senha inválidos" });
      const hashedPassword = crypto.createHash("sha256").update(password + email).digest("hex");
      if (hashedPassword !== user.password) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");
      res.json({ token, userId: user.id, email: user.email });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Erro ao fazer login" });
    }
  });

  // COMPANIES
  app.post(api.companies.create.path, async (req, res) => {
    try {
      const input = api.companies.create.input.parse(req.body);
      const userId = req.body.userId || 1;
      const company = await storage.createCompany({ ...input, userId });
      res.status(201).json(company);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.get(api.companies.list.path, async (req, res) => {
    const userId = req.query.userId ? Number(req.query.userId) : 1;
    const companies = await storage.getCompaniesByUser(userId);
    res.json(companies);
  });

  app.get(api.companies.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const company = await storage.getCompany(id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  });

  // ISO RECOMMENDATION
  app.post(api.iso.recommend.path, async (req, res) => {
    try {
      const input = api.iso.recommend.input.parse(req.body);
      const recommended = recommendIsos(input.sector);
      res.json({ recommended });
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // ISO SELECTION
  app.post(api.iso.select.path, async (req, res) => {
    try {
      const companyId = Number(req.params.id);
      const input = api.iso.select.input.parse(req.body);
      const selections = await storage.saveIsoSelections(companyId, input.isos);
      res.status(201).json(selections);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao salvar seleções" });
    }
  });

  app.get(api.iso.list.path, async (req, res) => {
    const companyId = Number(req.params.id);
    const selections = await storage.getIsoSelections(companyId);
    res.json(selections);
  });

  // DOCUMENT GENERATION — gera conjunto completo de documentos SGQ
  app.post(api.documents.generate.path, async (req, res) => {
    const companyId = Number(req.params.id);
    const company = await storage.getCompany(companyId);
    if (!company) return res.status(404).json({ message: "Empresa não encontrada" });

    const selections = await storage.getIsoSelections(companyId);
    const isoList = selections.map(s => s.isoCode);
    if (isoList.length === 0) {
      return res.status(400).json({ message: "Selecione as normas ISO primeiro antes de gerar os documentos." });
    }

    try {
      // Apaga docs antigos antes de regenerar
      await storage.deleteDocumentsByCompany(companyId);

      // Gera conjunto completo baseado nos templates ISO (10-15 docs por norma)
      const docSet = buildDocumentSet(company, isoList);

      // Tenta enriquecer com IA se disponível (sem travar a resposta)
      let aiEnhanced = false;
      if (process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY) {
        try {
          const prompt = `Você é um auditor sênior ISO. Revise e enriqueça o escopo e política para:
Empresa: ${company.name}, Setor: ${company.sector}, Porte: ${company.size}, Normas: ${isoList.join(', ')}.
Retorne APENAS um JSON: {"escopo": "texto 3 parágrafos", "politica": "texto 3 parágrafos"}`;
          const aiText = await callAI(prompt);
          const jsonStart = aiText.indexOf('{');
          const jsonEnd = aiText.lastIndexOf('}') + 1;
          if (jsonStart !== -1 && jsonEnd > jsonStart) {
            const parsed = JSON.parse(aiText.slice(jsonStart, jsonEnd));
            if (parsed.escopo && parsed.politica) {
              // Injeta conteúdo AI nos primeiros documentos relevantes
              const scopeDoc = docSet.find(d => d.type.includes("Escopo"));
              const policyDoc = docSet.find(d => d.type.includes("Política"));
              if (scopeDoc) scopeDoc.content = parsed.escopo + "\n\n" + scopeDoc.content;
              if (policyDoc) policyDoc.content = parsed.politica + "\n\n" + policyDoc.content;
              aiEnhanced = true;
            }
          }
        } catch (aiErr) {
          console.warn("IA indisponível, usando templates completos:", (aiErr as Error).message);
        }
      }

      // Salva todos os documentos
      const savedDocs = [];
      for (const d of docSet) {
        const saved = await storage.saveDocument({
          companyId,
          section: d.section,
          type: d.type,
          content: d.content,
        });
        savedDocs.push(saved);
      }

      console.log(`✅ Gerados ${savedDocs.length} documentos para empresa ${companyId} (IA: ${aiEnhanced})`);
      res.status(201).json(savedDocs);
    } catch (dbErr) {
      console.error("Erro ao salvar documentos:", dbErr);
      res.status(500).json({ message: "Erro ao salvar os documentos no banco de dados" });
    }
  });

  app.get(api.documents.list.path, async (req, res) => {
    const companyId = Number(req.params.id);
    const docs = await storage.getDocuments(companyId);
    res.json(docs);
  });

  // CHAT SUPPORT
  app.get(api.chat.list.path, async (req, res) => {
    const companyId = Number(req.params.id);
    const messages = await storage.getChatMessages(companyId);
    res.json(messages);
  });

  app.post(api.chat.send.path, async (req, res) => {
    const companyId = Number(req.params.id);
    const { content } = req.body;

    try {
      const company = await storage.getCompany(companyId);
      if (!company) return res.status(404).json({ message: "Empresa não encontrada" });

      const history = await storage.getChatMessages(companyId);
      const selections = await storage.getIsoSelections(companyId);
      const isoList = selections.map(s => s.isoCode);
      const docs = await storage.getDocuments(companyId);

      await storage.saveChatMessage({ companyId, role: "user", content });

      const recentHistory = history.slice(-6);
      const docContext = docs.slice(0, 3).map(d => `${d.type}: ${d.content.slice(0, 300)}`).join('\n\n');

      const prompt = `Você é um Consultor Especialista Sênior em Certificação ISO. Empresa: ${company.name} (${company.sector}, ${company.size} colaboradores). Normas: ${isoList.join(', ') || 'nenhuma'}.
Contexto dos documentos gerados:
${docContext}
Histórico recente:
${recentHistory.map(m => `${m.role === 'user' ? 'Cliente' : 'Consultor'}: ${m.content}`).join('\n')}
Cliente: ${content}
Responda de forma clara, profissional e em português do Brasil. Seja objetivo e prático.`;

      let aiContent = "Desculpe, o serviço de IA está temporariamente indisponível. Tente novamente em alguns instantes ou adicione uma chave de API (NVIDIA_API_KEY ou OPENAI_API_KEY) nas configurações.";
      try {
        aiContent = await callAI(prompt);
      } catch (aiErr) {
        console.warn("Chat IA indisponível:", (aiErr as Error).message);
      }

      const assistantMsg = await storage.saveChatMessage({ companyId, role: "assistant", content: aiContent });
      res.status(201).json(assistantMsg);
    } catch (err) {
      console.error("Chat Error:", err);
      res.status(500).json({ message: "Erro no suporte via IA" });
    }
  });

  return httpServer;
}
