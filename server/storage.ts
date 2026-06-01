import { eq, desc, and, sql, count } from "drizzle-orm";
import { db } from "./db";
import {
  users, companies, industrySectors, riskCategories, sectorQuestions,
  assessments, riskEvaluations, questionResponses, preventionResources,
  orders, invoices,
  type User, type InsertUser, type Company, type InsertCompany,
  type IndustrySector, type InsertIndustrySector, type RiskCategory,
  type InsertRiskCategory, type SectorQuestion, type InsertSectorQuestion,
  type Assessment, type InsertAssessment, type RiskEvaluation,
  type InsertRiskEvaluation, type QuestionResponse, type InsertQuestionResponse,
  type PreventionResource, type InsertPreventionResource,
  type Order, type InsertOrder, type Invoice, type InsertInvoice,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  getCompaniesByUser(userId: string): Promise<Company[]>;
  getCompanies(): Promise<Company[]>;
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: string): Promise<void>;
  getSectors(): Promise<IndustrySector[]>;
  getSector(id: string): Promise<IndustrySector | undefined>;
  createSector(sector: InsertIndustrySector): Promise<IndustrySector>;
  getRiskCategories(): Promise<RiskCategory[]>;
  getRiskCategory(id: string): Promise<RiskCategory | undefined>;
  createRiskCategory(category: InsertRiskCategory): Promise<RiskCategory>;
  getSectorQuestions(sectorId: string): Promise<SectorQuestion[]>;
  createSectorQuestion(question: InsertSectorQuestion): Promise<SectorQuestion>;
  getAssessmentsByUser(userId: string): Promise<Assessment[]>;
  getAssessments(): Promise<Assessment[]>;
  getAssessment(id: string): Promise<Assessment | undefined>;
  getAssessmentsByCompany(companyId: string): Promise<Assessment[]>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: string, assessment: Partial<InsertAssessment>): Promise<Assessment | undefined>;
  deleteAssessment(id: string): Promise<void>;
  getRiskEvaluations(assessmentId: string): Promise<RiskEvaluation[]>;
  createRiskEvaluation(evaluation: InsertRiskEvaluation): Promise<RiskEvaluation>;
  updateRiskEvaluation(id: string, evaluation: Partial<InsertRiskEvaluation>): Promise<RiskEvaluation | undefined>;
  getQuestionResponses(assessmentId: string): Promise<QuestionResponse[]>;
  createQuestionResponse(response: InsertQuestionResponse): Promise<QuestionResponse>;
  updateQuestionResponse(id: string, response: Partial<InsertQuestionResponse>): Promise<QuestionResponse | undefined>;
  deleteQuestionResponse(id: string): Promise<void>;
  getPreventionResources(): Promise<PreventionResource[]>;
  getPreventionResource(id: string): Promise<PreventionResource | undefined>;
  getPreventionResourcesByCategory(category: string): Promise<PreventionResource[]>;
  createPreventionResource(resource: InsertPreventionResource): Promise<PreventionResource>;
  updatePreventionResource(id: string, resource: Partial<InsertPreventionResource>): Promise<PreventionResource | undefined>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined>;
  deleteOrder(id: string): Promise<void>;
  getInvoicesByUser(userId: string): Promise<Invoice[]>;
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  getInvoiceByOrderId(orderId: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getCompaniesByUser(userId: string): Promise<Company[]> {
    return db.select().from(companies).where(eq(companies.userId, userId)).orderBy(desc(companies.createdAt));
  }

  async getCompanies(): Promise<Company[]> {
    return db.select().from(companies).orderBy(desc(companies.createdAt));
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [created] = await db.insert(companies).values(company).returning();
    return created;
  }

  async updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined> {
    const [updated] = await db.update(companies).set(company).where(eq(companies.id, id)).returning();
    return updated;
  }

  async deleteCompany(id: string): Promise<void> {
    await db.delete(companies).where(eq(companies.id, id));
  }

  async getSectors(): Promise<IndustrySector[]> {
    return db.select().from(industrySectors).orderBy(industrySectors.name);
  }

  async getSector(id: string): Promise<IndustrySector | undefined> {
    const [sector] = await db.select().from(industrySectors).where(eq(industrySectors.id, id));
    return sector;
  }

  async createSector(sector: InsertIndustrySector): Promise<IndustrySector> {
    const [created] = await db.insert(industrySectors).values(sector).returning();
    return created;
  }

  async getRiskCategories(): Promise<RiskCategory[]> {
    return db.select().from(riskCategories).orderBy(riskCategories.number);
  }

  async getRiskCategory(id: string): Promise<RiskCategory | undefined> {
    const [category] = await db.select().from(riskCategories).where(eq(riskCategories.id, id));
    return category;
  }

  async createRiskCategory(category: InsertRiskCategory): Promise<RiskCategory> {
    const [created] = await db.insert(riskCategories).values(category).returning();
    return created;
  }

  async getSectorQuestions(sectorId: string): Promise<SectorQuestion[]> {
    return db.select().from(sectorQuestions)
      .where(eq(sectorQuestions.sectorId, sectorId))
      .orderBy(sectorQuestions.orderIndex);
  }

  async createSectorQuestion(question: InsertSectorQuestion): Promise<SectorQuestion> {
    const [created] = await db.insert(sectorQuestions).values(question).returning();
    return created;
  }

  async getAssessmentsByUser(userId: string): Promise<Assessment[]> {
    return db.select().from(assessments).where(eq(assessments.userId, userId)).orderBy(desc(assessments.createdAt));
  }

  async getAssessments(): Promise<Assessment[]> {
    return db.select().from(assessments).orderBy(desc(assessments.createdAt));
  }

  async getAssessment(id: string): Promise<Assessment | undefined> {
    const [assessment] = await db.select().from(assessments).where(eq(assessments.id, id));
    return assessment;
  }

  async getAssessmentsByCompany(companyId: string): Promise<Assessment[]> {
    return db.select().from(assessments)
      .where(eq(assessments.companyId, companyId))
      .orderBy(desc(assessments.createdAt));
  }

  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const [created] = await db.insert(assessments).values(assessment).returning();
    return created;
  }

  async updateAssessment(id: string, assessment: Partial<InsertAssessment>): Promise<Assessment | undefined> {
    const [updated] = await db.update(assessments).set(assessment).where(eq(assessments.id, id)).returning();
    return updated;
  }

  async deleteAssessment(id: string): Promise<void> {
    await db.delete(questionResponses).where(eq(questionResponses.assessmentId, id));
    await db.delete(riskEvaluations).where(eq(riskEvaluations.assessmentId, id));
    await db.delete(assessments).where(eq(assessments.id, id));
  }

  async getRiskEvaluations(assessmentId: string): Promise<RiskEvaluation[]> {
    return db.select().from(riskEvaluations).where(eq(riskEvaluations.assessmentId, assessmentId));
  }

  async createRiskEvaluation(evaluation: InsertRiskEvaluation): Promise<RiskEvaluation> {
    const [created] = await db.insert(riskEvaluations).values(evaluation).returning();
    return created;
  }

  async updateRiskEvaluation(id: string, evaluation: Partial<InsertRiskEvaluation>): Promise<RiskEvaluation | undefined> {
    const [updated] = await db.update(riskEvaluations).set(evaluation).where(eq(riskEvaluations.id, id)).returning();
    return updated;
  }

  async getQuestionResponses(assessmentId: string): Promise<QuestionResponse[]> {
    return db.select().from(questionResponses).where(eq(questionResponses.assessmentId, assessmentId));
  }

  async createQuestionResponse(response: InsertQuestionResponse): Promise<QuestionResponse> {
    const [created] = await db.insert(questionResponses).values(response).returning();
    return created;
  }

  async updateQuestionResponse(id: string, response: Partial<InsertQuestionResponse>): Promise<QuestionResponse | undefined> {
    const [updated] = await db.update(questionResponses).set(response).where(eq(questionResponses.id, id)).returning();
    return updated;
  }

  async deleteQuestionResponse(id: string): Promise<void> {
    await db.delete(questionResponses).where(eq(questionResponses.id, id));
  }

  async getPreventionResources(): Promise<PreventionResource[]> {
    return db.select().from(preventionResources).orderBy(preventionResources.edNumber);
  }

  async getPreventionResource(id: string): Promise<PreventionResource | undefined> {
    const [resource] = await db.select().from(preventionResources).where(eq(preventionResources.id, id));
    return resource;
  }

  async getPreventionResourcesByCategory(category: string): Promise<PreventionResource[]> {
    return db.select().from(preventionResources)
      .where(eq(preventionResources.category, category))
      .orderBy(preventionResources.edNumber);
  }

  async createPreventionResource(resource: InsertPreventionResource): Promise<PreventionResource> {
    const [created] = await db.insert(preventionResources).values(resource).returning();
    return created;
  }

  async updatePreventionResource(id: string, resource: Partial<InsertPreventionResource>): Promise<PreventionResource | undefined> {
    const [updated] = await db.update(preventionResources).set(resource).where(eq(preventionResources.id, id)).returning();
    return updated;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db.insert(orders).values(order).returning();
    return created;
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined> {
    const [updated] = await db.update(orders).set(order).where(eq(orders.id, id)).returning();
    return updated;
  }

  async deleteOrder(id: string): Promise<void> {
    await db.delete(orders).where(eq(orders.id, id));
  }

  async getInvoicesByUser(userId: string): Promise<Invoice[]> {
    return db.select().from(invoices).where(eq(invoices.userId, userId)).orderBy(desc(invoices.createdAt));
  }

  async getInvoices(): Promise<Invoice[]> {
    return db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async getInvoiceByOrderId(orderId: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.orderId, orderId));
    return invoice;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [created] = await db.insert(invoices).values(invoice).returning();
    return created;
  }

  async updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [updated] = await db.update(invoices).set(invoice).where(eq(invoices.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
