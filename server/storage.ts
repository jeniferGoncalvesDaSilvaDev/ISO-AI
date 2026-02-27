import { db } from "./db";
import { companies, isoSelections, documents, chatMessages, type Company, type InsertCompany, type IsoSelection, type InsertIsoSelection, type Document, type InsertDocument, type ChatMessage, type InsertChatMessage } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  createCompany(company: InsertCompany): Promise<Company>;
  getCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  saveIsoSelections(companyId: number, isos: string[]): Promise<IsoSelection[]>;
  getIsoSelections(companyId: number): Promise<IsoSelection[]>;
  saveDocument(doc: InsertDocument): Promise<Document>;
  getDocuments(companyId: number): Promise<Document[]>;
  saveChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(companyId: number): Promise<ChatMessage[]>;
}

export class DatabaseStorage implements IStorage {
  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }
  async saveIsoSelections(companyId: number, isos: string[]): Promise<IsoSelection[]> {
    // Replace all existing selections for the company
    await db.delete(isoSelections).where(eq(isoSelections.companyId, companyId));
    if (isos.length === 0) return [];
    
    const values = isos.map(isoCode => ({ companyId, isoCode }));
    const inserted = await db.insert(isoSelections).values(values).returning();
    return inserted;
  }
  async getIsoSelections(companyId: number): Promise<IsoSelection[]> {
    return await db.select().from(isoSelections).where(eq(isoSelections.companyId, companyId));
  }
  async saveDocument(insertDocument: InsertDocument): Promise<Document> {
    const [doc] = await db.insert(documents).values(insertDocument).returning();
    return doc;
  }
  async getDocuments(companyId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.companyId, companyId));
  }
  async saveChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [saved] = await db.insert(chatMessages).values(message).returning();
    return saved;
  }
  async getChatMessages(companyId: number): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(eq(chatMessages.companyId, companyId));
  }
}

export const storage = new DatabaseStorage();
