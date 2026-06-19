import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import crypto from "crypto";
import { buildDocumentSet } from "./iso-templates";

// ── IA: OpenRouter ─────────────────────────────────────────────────────────
async function callAI(
  prompt: string,
  conversationHistory: { role: string; content: string; reasoning_details?: any }[] = []
): Promise<string> {
  const apiKey = process.env.API_KEY;
  const model = "openai/gpt-oss-120b:free";

  if (!apiKey) {
    throw new Error("Nenhuma IA configurada. Adicione API_KEY em Secrets.");
  }

  // Monta mensagens: histórico preservado + nova mensagem do user
  const messages = [
    ...conversationHistory,
    { role: "user", content: prompt },
  ];

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      reasoning: { enabled: true },
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${err}`);
  }

  const data = await res.json() as any;
  const text = data?.choices?.[0]?.message?.content || "";
  if (!text) throw new Error("OpenRouter retornou resposta vazia");
  return text;
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

  // REGISTER
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

  // LOGIN
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

  // DOCUMENT GENERATION
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
      await storage.deleteDocumentsByCompany(companyId);
      const docSet = buildDocumentSet(company, isoList);

      let aiEnhanced = false;
      try {
        const prompt = `Você é um consultor líder ISO 9001:2015 com vasta experiência em implementação e auditoria de certificação em empresas de manufatura, metalurgia e indústria em geral.

**FASE 1: DIAGNÓSTICO E PLANEJAMENTO (OBRIGATÓRIO)**

Antes de gerar qualquer documento, você DEVE realizar o seguinte diagnóstico da empresa:

1. **Contexto Organizacional**
   - Identificar as partes interessadas relevantes (clientes, fornecedores, órgãos reguladores, colaboradores)
   - Mapear as necessidades e expectativas de cada parte interessada
   - Identificar fatores internos e externos que impactam a qualidade

2. **Mapa de Processos**
   - Descrever detalhadamente o fluxograma de processos da empresa
   - Identificar processos principais, de suporte e gerenciais
   - Definir entradas, saídas, fornecedores e clientes de cada processo

3. **Matriz de Riscos e Oportunidades**
   - Listar riscos associados a cada processo (com probabilidade e impacto)
   - Propor ações de mitigação para riscos críticos
   - Identificar oportunidades de melhoria (redução de custos, aumento de eficiência, etc.)

4. **Objetivos da Qualidade**
   - Definir KPIs mensuráveis por processo (ex: taxa de defeitos < 2%, OEE > 85%, etc.)
   - Estabelecer metas quantitativas e prazos para cada objetivo
   - Alinhar objetivos com a Política da Qualidade

**FASE 2: GERAÇÃO DE DOCUMENTOS**

Com base no diagnóstico acima, gere UM ÚNICO DOCUMENTO COMPLETO PARA CADA ITEM da matriz documental obrigatória.

**ESTRUTURA OBRIGATÓRIA PARA CADA DOCUMENTO:**

**CABEÇALHO INSTITUCIONAL**
- Logomarca (descritiva, ex: "Nome da Empresa - SGQ")
- Título do Documento
- Código do Documento (conforme matriz)
- Revisão: 00
- Data de Emissão: [data atual]
- Próxima Revisão: [data atual + 1 ano]

**CORPO DO DOCUMENTO (mínimo 1200 palavras)**

1. OBJETIVO
   Descrever claramente o propósito do documento, alinhado com a ISO 9001:2015

2. ESCOPO
   Definir a abrangência do documento (processos, áreas, produtos/serviços)

3. RESPONSABILIDADES
   - Quem elabora, quem revisa, quem aprova
   - Responsabilidades específicas por cargo/função

4. DEFINIÇÕES E SIGLAS
   Glossário técnico com todos os termos relevantes

5. DESCRIÇÃO DETALHADA
   - Como o processo/função é executado
   - Sequência de atividades (passo a passo)
   - Critérios de entrada e saída

6. FLUXO DO PROCESSO
   - Descrição narrativa do fluxograma
   - Pontos de decisão e alternativas
   - Interfaces com outros processos

7. INDICADORES DE DESEMPENHO
   - Métricas específicas para monitoramento
   - Frequência de medição
   - Metas quantitativas
   - Responsável pela coleta

8. REGISTROS ASSOCIADOS
   - Documentos gerados como evidência
   - Formulários utilizados
   - Local de armazenamento e tempo de retenção

9. REFERÊNCIAS NORMATIVAS
   - Itens específicos da ISO 9001:2015
   - Legislação aplicável
   - Documentos correlacionados do SGQ

10. HISTÓRICO DE REVISÕES
    - Data, descrição da alteração, autor

11. APROVAÇÃO
    - Nome e cargo do aprovador
    - Assinatura (descritiva)

**MATRIZ DOCUMENTAL OBRIGATÓRIA:**

ESTRUTURA DO SGQ:
- SGQ-01 Escopo do Sistema de Gestão da Qualidade (incluir exclusões justificadas)
- SGQ-02 Mapa de Processos (incluir interação entre processos)
- SGQ-03 Política da Qualidade (compromisso com qualidade, melhoria contínua)
- SGQ-04 Objetivos da Qualidade (metas mensuráveis para cada processo)

PROCEDIMENTOS:
- PQ-01 Controle de Documentos e Registros (incluir procedimento para documentos obsoletos)
- PQ-02 Controle de Não Conformidade e Ação Corretiva (incluir análise de causa raiz)
- PQ-03 Auditoria Interna (incluir programa de auditoria, cronograma)
- PQ-04 Análise Crítica pela Direção (incluir pauta, periodicidade)
- PQ-05 Controle de Produto Não Conforme (incluir fluxo de decisão: retrabalho, sucata, etc.)
- PQ-06 Rastreabilidade de Produção (incluir sistema de identificação único)
- PQ-07 Inspeção e Controle da Qualidade (incluir critérios de aceitação/rejeição)

REGISTROS:
- FQ-01 Lista Mestra de Documentos (controle de versões)
- FQ-02 Registro de Não Conformidade e Ação Corretiva (tabela com campos preenchidos)
- FQ-03 Registro de Auditoria Interna (checklist, evidências)
- OP-2026-001 Ordem de Produção (com especificações técnicas)
- RQ-01 Registro de Inspeção (com resultados de medições)
- RQ-02 Registro de Retrabalho e Sucata (quantificação e custos)
- RT-01 Registro de Treinamento (habilidades, certificações)
- RT-02 Lista de Presença (treinamentos, reuniões)
- RT-03 Matriz de Competência (habilidades por função)
- RC-01 Registro de Calibração (equipamentos de medição)

FORMULÁRIOS:
- FQ-02 Modelo de Não Conformidade
- FQ-03 Modelo de Auditoria
- FQ-04 Modelo de Ordem de Produção
- FQ-05 Modelo de Inspeção
- FQ-06 Modelo de Treinamento

DOCUMENTOS EXTERNOS CONTROLADOS:
- Certificados de Matéria-Prima (MTR) - modelo de controle
- Desenhos de Clientes - procedimento de arquivamento
- Especificações Técnicas - sistema de atualização
- Certificados de Calibração - plano de calibração

**REQUISITOS DE QUALIDADE:**

1. Coerência documental: todos os documentos devem se referenciar e criar um sistema integrado
2. Utilizar os dados reais da empresa: ${company.name}, Setor: ${company.sector}, Porte: ${company.size}, ${isoList.join(', ')}
3. Linguagem técnica e profissional, mas acessível
4. Conteúdo prático e aplicável, com exemplos concretos
5. Profundidade compatível com consultoria de R$ 15.000 a R$ 30.000
6. Mínimo de 1200 palavras por documento

**IMPORTANTE:** 
- Gere os documentos em português do Brasil
- Utilize dados fictícios coerentes com o setor (ex: produtos específicos, equipamentos, etc.)
- Inclua números de processos, códigos de produtos e dados realistas
- Documentos devem estar prontos para implementação imediata

Retorne APENAS um JSON válido, sem markdown: {"escopo": "texto 3 parágrafos", "politica": "texto 3 parágrafos"}`;
        const aiText = await callAI(prompt);
        const jsonStart = aiText.indexOf('{');
        const jsonEnd = aiText.lastIndexOf('}') + 1;
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          const parsed = JSON.parse(aiText.slice(jsonStart, jsonEnd));
          if (parsed.escopo && parsed.politica) {
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

    if (!content?.trim()) {
      return res.status(400).json({ message: "Mensagem não pode ser vazia" });
    }

    try {
      const company = await storage.getCompany(companyId);
      if (!company) return res.status(404).json({ message: "Empresa não encontrada" });

      const history = await storage.getChatMessages(companyId);
      const selections = await storage.getIsoSelections(companyId);
      const isoList = selections.map(s => s.isoCode);
      const docs = await storage.getDocuments(companyId);

      await storage.saveChatMessage({ companyId, role: "user", content });

      const docContext = docs.slice(0, 3).map(d => `${d.type}: ${d.content.slice(0, 300)}`).join('\n\n');

      // Monta histórico no formato OpenRouter preservando reasoning_details
      const conversationHistory = history.slice(-6).map(m => ({
        role: m.role,
        content: m.content,
        ...(m.reasoning_details ? { reasoning_details: m.reasoning_details } : {}),
      }));

      const systemPrompt = `Você é um Consultor Especialista Sênior em Certificação ISO.
Empresa: ${company.name} (${company.sector}, ${company.size} colaboradores).
Normas: ${isoList.join(', ') || 'nenhuma'}.
Contexto dos documentos gerados:
${docContext}
Responda de forma clara, profissional e em português do Brasil. Seja objetivo e prático.`;

      let aiContent: string;
      try {
        // Passa systemPrompt como primeira mensagem do histórico
        aiContent = await callAI(content, [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
        ]);
      } catch (aiErr) {
        console.warn("Chat IA indisponível:", (aiErr as Error).message);
        aiContent = "Desculpe, o serviço de IA está temporariamente indisponível. Verifique se as chaves estão configuradas corretamente nos Secrets.";
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