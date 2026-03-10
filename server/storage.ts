import { db } from "./db";
import { users, companies, isoSelections, documents, chatMessages, type User, type InsertUser, type Company, type InsertCompany, type IsoSelection, type InsertIsoSelection, type Document, type InsertDocument, type ChatMessage, type InsertChatMessage } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  getCompaniesByUser(userId: number): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  saveIsoSelections(companyId: number, isos: string[]): Promise<IsoSelection[]>;
  getIsoSelections(companyId: number): Promise<IsoSelection[]>;
  saveDocument(doc: InsertDocument): Promise<Document>;
  getDocuments(companyId: number): Promise<Document[]>;
  saveChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(companyId: number): Promise<ChatMessage[]>;
}

export class DatabaseStorage implements IStorage {
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }
  async getCompaniesByUser(userId: number): Promise<Company[]> {
    return await db.select().from(companies).where(eq(companies.userId, userId));
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
