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
      return res.status(400).json({ message: "Select ISOs first before generating documents" });
    }

    try {
      const prompt = `Atue como um auditor e consultor sênior de certificação ISO.
      Gere 3 documentos formais de certificação ISO para a seguinte empresa:
      Nome: ${company.name}
      Setor: ${company.sector}
      Tamanho: ${company.size}
      Normas aplicáveis: ${isoList.join(', ')}. 
      
      Os documentos devem ser:
      1. Manual da Qualidade
      2. Política da Empresa
      3. Plano de Ação
      
      Escreva o conteúdo de forma profissional e adaptado ao setor da empresa.
      Retorne APENAS um JSON válido neste exato formato de array de objetos, sem formatação markdown extra ao redor:
      [
        { "type": "Manual da Qualidade", "content": "conteúdo extenso aqui..." },
        { "type": "Política da Empresa", "content": "conteúdo extenso aqui..." },
        { "type": "Plano de Ação", "content": "conteúdo extenso aqui..." }
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
        // Fallback in case Gemini responds weirdly
        generatedDocs = [
          { type: "Manual da Qualidade", content: `Sistema de gestão criado automaticamente para ${company.name}.\nData: ${new Date().toLocaleDateString()}` },
          { type: "Política da Empresa", content: `A empresa ${company.name} compromete-se com a melhoria contínua seguindo as normas ${isoList.join(', ')}.` },
          { type: "Plano de Ação", content: `Plano inicial gerado para adequação das normas: ${isoList.join(', ')}.` }
        ];
      }

      const savedDocs = [];
      for (const d of generatedDocs) {
        const saved = await storage.saveDocument({ companyId: company.id, type: d.type, content: d.content });
        savedDocs.push(saved);
      }

      res.status(201).json(savedDocs);
    } catch (err) {
      console.error("AI Generation Error:", err);
      res.status(500).json({ message: "Failed to generate documents with AI" });
    }
  });

  app.get(api.documents.list.path, async (req, res) => {
    const companyId = Number(req.params.id);
    const docs = await storage.getDocuments(companyId);
    res.json(docs);
  });

  seedDatabase().catch(console.error);

  return httpServer;
}
