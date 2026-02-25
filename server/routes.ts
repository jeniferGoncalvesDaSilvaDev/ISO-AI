import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini via Replit AI Integrations
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

function recommendIsos(sector: string): string[] {
  const s = sector.toLowerCase();
  if (s.includes("software") || s.includes("tecnologia") || s.includes("tech")) return ["ISO 27001", "ISO 9001"];
  if (s.includes("industria") || s.includes("fábrica")) return ["ISO 9001", "ISO 14001"];
  if (s.includes("clinica") || s.includes("saude") || s.includes("saúde")) return ["ISO 13485", "ISO 9001"];
  if (s.includes("alimento") || s.includes("restaurante")) return ["ISO 22000", "ISO 9001"];
  return ["ISO 9001"];
}

async function seedDatabase() {
  const existing = await storage.getCompanies();
  if (existing.length === 0) {
    const c1 = await storage.createCompany({ name: "TechNova Solutions", sector: "Software Development", size: "10-50" });
    await storage.saveIsoSelections(c1.id, ["ISO 9001", "ISO 27001"]);
    await storage.saveDocument({ 
      companyId: c1.id, 
      type: "Manual da Qualidade", 
      content: "A TechNova Solutions se compromete com a excelência na entrega de softwares seguros e de alta qualidade. Nosso sistema de gestão assegura a melhoria contínua de nossos processos e a satisfação de nossos clientes." 
    });
    await storage.saveDocument({
      companyId: c1.id,
      type: "Plano de Ação",
      content: "- Mapeamento dos processos internos\n- Treinamento da equipe em segurança da informação\n- Auditoria interna programada"
    });
  }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.post(api.companies.create.path, async (req, res) => {
    try {
      const input = api.companies.create.input.parse(req.body);
      const company = await storage.createCompany(input);
      res.status(201).json(company);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.get(api.companies.list.path, async (req, res) => {
    const companies = await storage.getCompanies();
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
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
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
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const selections = await storage.getIsoSelections(companyId);
    const isoList = selections.map(s => s.isoCode);
    
    if (isoList.length === 0) {
      return res.status(400).json({ message: "Selecione as ISOs primeiro antes de gerar os documentos" });
    }

    try {
      const prompt = `Atue como um Especialista Sênior e Auditor de Certificação ISO. Sua missão é fornecer consultoria de alto nível para empresas que buscam conformidade total.
      
      Gere 3 documentos formais e robustos de certificação ISO para a seguinte empresa:
      Nome: ${company.name}
      Setor: ${company.sector}
      Tamanho: ${company.size}
      Normas aplicáveis: ${isoList.join(', ')}. 
      
      IMPORTANTE: Se a empresa cresceu ou mudou de porte, adapte o conteúdo para a nova realidade operacional. Os documentos devem ser técnicos, precisos e prontos para auditoria.
      
      Os documentos devem ser:
      1. Manual da Qualidade (ou Sistema de Gestão Integrado)
      2. Política da Empresa (Compromisso com as normas selecionadas)
      3. Plano de Ação Estratégico (Passos para implementação e manutenção)
      
      Escreva o conteúdo de forma profissional em Português Brasileiro.
      Retorne APENAS um JSON válido neste exato formato de array de objetos, sem formatação markdown extra ao redor:
      [
        { "type": "Manual da Qualidade", "content": "conteúdo técnico e extenso aqui..." },
        { "type": "Política da Empresa", "content": "conteúdo técnico e extenso aqui..." },
        { "type": "Plano de Ação", "content": "conteúdo técnico e extenso aqui..." }
      ]`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text = response.text || "";
      let generatedDocs = [];
      
      // Parse the JSON array out of the response (handles markdown blocks if returned)
      const jsonStart = text.indexOf('[');
      const jsonEnd = text.lastIndexOf(']') + 1;
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        try {
           generatedDocs = JSON.parse(text.slice(jsonStart, jsonEnd));
        } catch(e) {
           console.error("Failed to parse JSON from AI", e);
        }
      }

      if (generatedDocs.length === 0) {
        generatedDocs = [
          { type: "Manual da Qualidade", content: `Sistema de gestão profissional criado por Especialista ISO para ${company.name}.\nData: ${new Date().toLocaleDateString()}` },
          { type: "Política da Empresa", content: `A empresa ${company.name} estabelece sua política de excelência baseada nas normas ${isoList.join(', ')}.` },
          { type: "Plano de Ação", content: `Roteiro estratégico para conformidade das normas: ${isoList.join(', ')}.` }
        ];
      }

      // We allow regenerating documents, so we don't necessarily delete old ones but we mark them with createdAt
      const savedDocs = [];
      for (const d of generatedDocs) {
        const saved = await storage.saveDocument({ companyId: company.id, type: d.type, content: d.content });
        savedDocs.push(saved);
      }

      res.status(201).json(savedDocs);
    } catch (err) {
      console.error("AI Generation Error:", err);
      res.status(500).json({ message: "Falha ao gerar documentos com a IA" });
    }
  });

  app.get(api.documents.list.path, async (req, res) => {
    const companyId = Number(req.params.id);
    const docs = await storage.getDocuments(companyId);
    res.json(docs);
  });

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

      // Save user message
      const userMsg = await storage.saveChatMessage({ companyId, role: "user", content });

      const prompt = `Você é um Consultor Especialista Sênior em Certificação ISO e Gestão de Qualidade. Sua missão é fornecer suporte diário e técnico para a empresa ${company.name} (${company.sector}).
      
      Contexto atual da empresa:
      - Setor: ${company.sector}
      - Tamanho: ${company.size}
      - Normas de interesse: ${isoList.join(', ') || 'Nenhuma selecionada ainda'}
      
      Histórico de conversa:
      ${history.map(m => `${m.role === 'user' ? 'Cliente' : 'Especialista'}: ${m.content}`).join('\n')}
      
      Cliente pergunta: ${content}
      
      Responda de forma profissional, acolhedora e altamente técnica, como um consultor real faria.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const aiContent = response.text || "Desculpe, tive um problema ao processar sua solicitação.";
      const assistantMsg = await storage.saveChatMessage({ companyId, role: "assistant", content: aiContent });

      res.status(201).json(assistantMsg);
    } catch (err) {
      console.error("Chat Error:", err);
      res.status(500).json({ message: "Erro no suporte via IA" });
    }
  });

  seedDatabase().catch(console.error);

  return httpServer;
}
