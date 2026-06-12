import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import crypto from "crypto";

// Chama OpenRouter com a chave definida em Secrets como "api_key"
// Tenta modelos em sequência até um funcionar
async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.api_key || "";

  if (!apiKey) {
    throw new Error("Secret 'api_key' não encontrado. Configure em Secrets.");
  }

  const models = [
    "mistralai/mistral-small-3.2-24b-instruct:free",
    "meta-llama/llama-3-8b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
  ];

  for (const model of models) {
    try {
      console.log(`Tentando modelo: ${model}`);
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.warn(`Modelo ${model} falhou:`, JSON.stringify(err));
        continue; // tenta o próximo
      }

      const data = await response.json() as any;
      const content = data.choices?.[0]?.message?.content || "";
      if (content) {
        console.log(`Modelo ${model} funcionou!`);
        return content;
      }
    } catch (e: any) {
      console.warn(`Erro no modelo ${model}:`, e.message);
      continue;
    }
  }

  throw new Error("Nenhum modelo disponível no OpenRouter.");
}

function recommendIsos(sector: string): string[] {
  const s = sector.toLowerCase();
  if (s.includes("software") || s.includes("tecnologia") || s.includes("tech")) return ["ISO 27001", "ISO 9001"];
  if (s.includes("industria") || s.includes("fábrica")) return ["ISO 9001", "ISO 14001"];
  if (s.includes("clinica") || s.includes("saude") || s.includes("saúde")) return ["ISO 13485", "ISO 9001"];
  if (s.includes("alimento") || s.includes("restaurante")) return ["ISO 22000", "ISO 9001"];
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
      if (!user) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

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
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json(company);
  });

  app.post(api.iso.recommend.path, async (req, res) => {
    try {
      const input = api.iso.recommend.input.parse(req.body);
      const recommended = recommendIsos(input.sector);
      res.json({ recommended });
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.iso.select.path, async (req, res) => {
    try {
      const companyId = Number(req.params.id);
      const input = api.iso.select.input.parse(req.body);
      const selections = await storage.saveIsoSelections(companyId, input.isos);

      res.status(201).json(selections);

      // Geração em background
      (async () => {
        try {
          const company = await storage.getCompany(companyId);
          if (!company) return;

          const prompt = `Atue como um Especialista Sênior e Auditor de Certificação ISO. 
          Gere 3 documentos formais para a empresa ${company.name} (${company.sector}), tamanho ${company.size}.
          Normas: ${input.isos.join(', ')}.

          Retorne APENAS um JSON válido de array de objetos:
          [
            { "type": "Manual da Qualidade", "content": "..." },
            { "type": "Política da Empresa", "content": "..." },
            { "type": "Plano de Ação", "content": "..." }
          ]`;

          const text = await callGemini(prompt);
          const jsonStart = text.indexOf('[');
          const jsonEnd = text.lastIndexOf(']') + 1;

          if (jsonStart !== -1 && jsonEnd !== -1) {
            const generatedDocs = JSON.parse(text.slice(jsonStart, jsonEnd));
            for (const d of generatedDocs) {
              await storage.saveDocument({ companyId, type: d.type, content: d.content });
            }
          }
        } catch (e) {
          console.error("Background Generation Error:", e);
        }
      })();
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

  app.post(api.documents.generate.path, async (req, res) => {
    const companyId = Number(req.params.id);
    const company = await storage.getCompany(companyId);
    if (!company) return res.status(404).json({ message: "Empresa não encontrada" });

    const selections = await storage.getIsoSelections(companyId);
    const isoList = selections.map(s => s.isoCode);
    if (isoList.length === 0) {
      return res.status(400).json({ message: "Selecione as ISOs primeiro antes de gerar os documentos" });
    }

    const data = new Date().toLocaleDateString("pt-BR");
    const fallbackDocs = [
      {
        type: "Manual da Qualidade",
        content: `MANUAL DA QUALIDADE — ${company.name}\nEmitido em: ${data}\nNormas: ${isoList.join(', ')}\n\n1. APRESENTAÇÃO DA EMPRESA\n${company.name} é uma organização do setor de ${company.sector} comprometida com a excelência operacional e a melhoria contínua de seus processos.\n\n2. ESCOPO DO SISTEMA DE GESTÃO\nEste Manual abrange todos os processos, produtos e serviços da ${company.name}, alinhados às exigências das normas ${isoList.join(', ')}.\n\n3. POLÍTICA DA QUALIDADE\nA liderança da ${company.name} se compromete com a satisfação total dos clientes, a conformidade regulatória e a melhoria contínua de todos os processos internos.\n\n4. RESPONSABILIDADES\n- Alta Direção: Garantir recursos e liderança para o SGQ\n- Gestores: Implementar e monitorar os processos em suas áreas\n- Colaboradores: Cumprir os procedimentos e reportar não conformidades\n\n5. CONTROLE DE DOCUMENTOS\nTodos os documentos do SGQ são controlados, revisados periodicamente e aprovados pela Alta Direção antes de sua divulgação.`
      },
      {
        type: "Política da Empresa",
        content: `POLÍTICA INTEGRADA — ${company.name}\nEmitida em: ${data}\n\nA ${company.name}, empresa atuante no setor de ${company.sector} com ${company.size} colaboradores, declara seu compromisso formal com os seguintes princípios:\n\n✅ QUALIDADE: Entregar produtos/serviços que superem as expectativas dos clientes, em conformidade com a ${isoList.includes('ISO 9001') ? 'ISO 9001' : isoList[0]}.\n\n✅ SEGURANÇA DA INFORMAÇÃO: ${isoList.includes('ISO 27001') ? 'Proteger os ativos de informação contra acessos não autorizados, em conformidade com a ISO 27001.' : 'Garantir a confidencialidade e integridade das informações corporativas.'}\n\n✅ RESPONSABILIDADE: Agir com ética, transparência e respeito a todas as partes interessadas.\n\n✅ MELHORIA CONTÍNUA: Revisar e aprimorar continuamente todos os processos e sistemas de gestão.\n\nEsta política é comunicada a todos os colaboradores, revisada anualmente e disponível publicamente.\n\nAssinado pela Alta Direção — ${data}`
      },
      {
        type: "Plano de Ação",
        content: `PLANO DE AÇÃO ESTRATÉGICO — ${company.name}\nElaborado em: ${data}\nNormas-alvo: ${isoList.join(', ')}\n\nFASE 1 — DIAGNÓSTICO (Mês 1-2)\n□ Realizar análise de lacunas (gap analysis) com base nos requisitos das normas ${isoList.join(', ')}\n□ Mapear todos os processos críticos da organização\n□ Identificar partes interessadas e suas expectativas\n□ Designar Representante da Direção para o SGQ\n\nFASE 2 — PLANEJAMENTO (Mês 2-3)\n□ Definir objetivos mensuráveis da qualidade por área\n□ Elaborar ou atualizar todos os procedimentos operacionais\n□ Criar matriz de riscos e oportunidades\n□ Planejar calendário de treinamentos\n\nFASE 3 — IMPLEMENTAÇÃO (Mês 3-5)\n□ Treinar 100% dos colaboradores nos novos procedimentos\n□ Implementar controles de documentos e registros\n□ Executar o plano de comunicação interna\n□ Iniciar monitoramento de indicadores de desempenho\n\nFASE 4 — VERIFICAÇÃO E AUDITORIA (Mês 5-6)\n□ Realizar Auditoria Interna completa\n□ Conduzir Revisão pela Direção\n□ Corrigir não conformidades identificadas\n□ Solicitar Auditoria de Certificação com organismo acreditado\n\nINDICADORES DE SUCESSO:\n- Taxa de conformidade com requisitos normativos > 95%\n- Zero não conformidades críticas na auditoria externa\n- Satisfação do cliente > 90%`
      }
    ];

    let generatedDocs = fallbackDocs;

    try {
      const prompt = `Você é um auditor sênior de certificação ISO. Gere 3 documentos formais para:
Nome: ${company.name}, Setor: ${company.sector}, Tamanho: ${company.size}, Normas: ${isoList.join(', ')}.
Retorne APENAS um array JSON válido (sem markdown):
[{"type":"Manual da Qualidade","content":"..."},{"type":"Política da Empresa","content":"..."},{"type":"Plano de Ação","content":"..."}]`;

      const text = await callGemini(prompt);
      const jsonStart = text.indexOf('[');
      const jsonEnd = text.lastIndexOf(']') + 1;

      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const parsed = JSON.parse(text.slice(jsonStart, jsonEnd));
        if (Array.isArray(parsed) && parsed.length > 0) {
          generatedDocs = parsed;
        }
      }
    } catch (aiErr) {
      console.warn("IA indisponível, usando documentos padrão:", (aiErr as Error).message);
    }

    try {
      const savedDocs = [];
      for (const d of generatedDocs) {
        const saved = await storage.saveDocument({ companyId: company.id, type: d.type, content: d.content });
        savedDocs.push(saved);
      }
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

  app.get(api.chat.list.path, async (req, res) => {
    const companyId = Number(req.params.id);
    try {
      const msgs = await storage.getChatMessages(companyId);
      res.json(msgs);
    } catch (err) {
      console.error("Chat list error:", err);
      res.json([]);
    }
  });

  app.post(api.chat.send.path, async (req, res) => {
    const companyId = Number(req.params.id);
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Mensagem não pode estar vazia" });
    }

    try {
      const company = await storage.getCompany(companyId);
      if (!company) return res.status(404).json({ message: "Empresa não encontrada" });

      const history = await storage.getChatMessages(companyId);
      const selections = await storage.getIsoSelections(companyId);
      const isoList = selections.map((s: any) => s.isoCode);
      const docs = await storage.getDocuments(companyId);

      // Salva mensagem do usuário
      await storage.saveChatMessage({ companyId, role: "user", content });

      const prompt = `Você é um Consultor Especialista Sênior em Certificação ISO e Gestão de Qualidade. Sua missão é fornecer suporte diário e técnico para a empresa ${company.name} (${company.sector}).

      Contexto atual da empresa:
      - Setor: ${company.sector}
      - Tamanho: ${company.size}
      - Normas de interesse: ${isoList.join(', ') || 'Nenhuma selecionada ainda'}

      Documentos Já Gerados pela IA para Consulta:
      ${docs.map((d: any) => `--- ${d.type} ---\n${d.content}`).join('\n\n')}

      Histórico de conversa:
      ${history.map((m: any) => `${m.role === 'user' ? 'Cliente' : 'Especialista'}: ${m.content}`).join('\n')}

      Cliente pergunta: ${content}

      Responda de forma profissional, acolhedora e altamente técnica. Se o cliente perguntar algo sobre os documentos acima, use o conteúdo deles para responder.`;

      const aiContent = await callGemini(prompt).catch(() => "Desculpe, tive um problema ao processar sua solicitação. Tente novamente.");
      const assistantMsg = await storage.saveChatMessage({ companyId, role: "assistant", content: aiContent });

      res.status(201).json(assistantMsg);
    } catch (err) {
      console.error("Chat Error:", err);
      res.status(500).json({ message: "Erro no suporte via IA" });
    }
  });

  return httpServer;
}
