import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("commercial"),
  fullName: text("full_name").notNull().default(""),
  email: text("email"),
  phone: text("phone"),
  region: text("region"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  name: text("name").notNull(),
  siret: text("siret"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  phone: text("phone"),
  email: text("email"),
  contactName: text("contact_name"),
  contactRole: text("contact_role"),
  industrySectorId: varchar("industry_sector_id"),
  employeeCount: integer("employee_count"),
  notes: text("notes"),
  status: text("status").notNull().default("prospect"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const industrySectors = pgTable("industry_sectors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code"),
  description: text("description"),
  icon: text("icon"),
  category: text("category"),
});

export const riskCategories = pgTable("risk_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  number: integer("number").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  color: text("color"),
  examples: text("examples").array(),
  preventionMeasures: text("prevention_measures").array(),
  dangerousSituations: text("dangerous_situations").array(),
  references: text("references").array(),
});

export const sectorQuestions = pgTable("sector_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectorId: varchar("sector_id").notNull(),
  riskCategoryId: varchar("risk_category_id"),
  module: text("module").notNull(),
  question: text("question").notNull(),
  description: text("description"),
  preventionMeasure: text("prevention_measure"),
  orderIndex: integer("order_index").default(0),
});

export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  companyId: varchar("company_id").notNull(),
  assessorName: text("assessor_name").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  status: text("status").notNull().default("in_progress"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const riskEvaluations = pgTable("risk_evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull(),
  riskCategoryId: varchar("risk_category_id").notNull(),
  isPresent: boolean("is_present").default(false),
  gravityLevel: integer("gravity_level").default(0),
  probabilityLevel: integer("probability_level").default(0),
  existingMeasures: text("existing_measures"),
  proposedActions: text("proposed_actions"),
  priority: text("priority"),
  observations: text("observations"),
});

export const preventionResources = pgTable("prevention_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  edNumber: text("ed_number").notNull(),
  title: text("title").notNull(),
  sector: text("sector").notNull(),
  category: text("category").notNull(),
  sectorCode: text("sector_code"),
  edition: text("edition"),
  summary: text("summary"),
  keyStats: jsonb("key_stats"),
  mainRisks: jsonb("main_risks"),
  preventionActions: jsonb("prevention_actions"),
  supportActors: jsonb("support_actors"),
  employeeSteps: jsonb("employee_steps"),
  references: jsonb("references"),
  inrsUrl: text("inrs_url"),
  pdfFileName: text("pdf_file_name"),
});

export const questionResponses = pgTable("question_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull(),
  questionId: varchar("question_id").notNull(),
  response: boolean("response"),
  gravityLevel: integer("gravity_level").default(0),
  probabilityLevel: integer("probability_level").default(0),
  priority: text("priority"),
  observations: text("observations"),
  actionPlan: text("action_plan"),
  responsible: text("responsible"),
  deadline: text("deadline"),
  budget: text("budget"),
  actionStatus: text("action_status").default("a_faire"),
  existingMeasures: text("existing_measures"),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  orderNumber: text("order_number").notNull().unique(),
  companyId: varchar("company_id").notNull(),
  companyName: text("company_name").notNull(),
  companySiret: text("company_siret"),
  companyAddress: text("company_address"),
  companyCity: text("company_city"),
  companyPostalCode: text("company_postal_code"),
  companyContactName: text("company_contact_name"),
  companyContactRole: text("company_contact_role"),
  companyEmail: text("company_email"),
  companyPhone: text("company_phone"),
  items: jsonb("items").notNull(),
  totalHT: integer("total_ht").notNull(),
  tvaRate: integer("tva_rate").notNull().default(20),
  totalTVA: integer("total_tva").notNull(),
  totalTTC: integer("total_ttc").notNull(),
  status: text("status").notNull().default("draft"),
  signatureData: text("signature_data"),
  stampNote: text("stamp_note"),
  validatedAt: timestamp("validated_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  invoiceNumber: text("invoice_number").notNull().unique(),
  orderId: varchar("order_id").notNull(),
  companyId: varchar("company_id").notNull(),
  companyName: text("company_name").notNull(),
  companySiret: text("company_siret"),
  companyAddress: text("company_address"),
  companyCity: text("company_city"),
  companyPostalCode: text("company_postal_code"),
  companyContactName: text("company_contact_name"),
  companyEmail: text("company_email"),
  items: jsonb("items").notNull(),
  totalHT: integer("total_ht").notNull(),
  tvaRate: integer("tva_rate").notNull().default(20),
  totalTVA: integer("total_tva").notNull(),
  totalTTC: integer("total_ttc").notNull(),
  status: text("status").notNull().default("emise"),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({ username: true, password: true, role: true, fullName: true, email: true, phone: true, region: true, isActive: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export const insertIndustrySectorSchema = createInsertSchema(industrySectors).omit({ id: true });
export const insertRiskCategorySchema = createInsertSchema(riskCategories).omit({ id: true });
export const insertSectorQuestionSchema = createInsertSchema(sectorQuestions).omit({ id: true });
export const insertAssessmentSchema = createInsertSchema(assessments).omit({ id: true, createdAt: true });
export const insertRiskEvaluationSchema = createInsertSchema(riskEvaluations).omit({ id: true });
export const insertPreventionResourceSchema = createInsertSchema(preventionResources).omit({ id: true });
export const insertQuestionResponseSchema = createInsertSchema(questionResponses).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type IndustrySector = typeof industrySectors.$inferSelect;
export type InsertIndustrySector = z.infer<typeof insertIndustrySectorSchema>;
export type RiskCategory = typeof riskCategories.$inferSelect;
export type InsertRiskCategory = z.infer<typeof insertRiskCategorySchema>;
export type SectorQuestion = typeof sectorQuestions.$inferSelect;
export type InsertSectorQuestion = z.infer<typeof insertSectorQuestionSchema>;
export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type RiskEvaluation = typeof riskEvaluations.$inferSelect;
export type InsertRiskEvaluation = z.infer<typeof insertRiskEvaluationSchema>;
export type PreventionResource = typeof preventionResources.$inferSelect;
export type InsertPreventionResource = z.infer<typeof insertPreventionResourceSchema>;
export type QuestionResponse = typeof questionResponses.$inferSelect;
export type InsertQuestionResponse = z.infer<typeof insertQuestionResponseSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export interface OrderItem {
  description: string;
  quantity: number;
  unitPriceHT: number;
  totalHT: number;
}

export const SATIS_CONSEILS = {
  name: "SATIS CONSEILS",
  forme: "SAS, societe par actions simplifiee",
  siren: "932047046",
  siret: "93204704600010",
  tvaIntra: "FR41932047046",
  naf: "7022Z",
  nafLabel: "Conseil pour les affaires et autres conseils de gestion",
  rcs: "RCS Paris",
  address: "60 RUE FRANCOIS IER",
  postalCode: "75008",
  city: "PARIS",
  immatriculation: "16/08/2024",
} as const;

export const PRESTATIONS = [
  {
    code: "DUERP_CREATION",
    description: "Etablissement du DUERP - Etude des risques et dangers dans l'entreprise",
    unitPriceHT: 90000,
  },
  {
    code: "DUERP_MAJ",
    description: "Mise a jour annuelle du DUERP (a date anniversaire)",
    unitPriceHT: 20000,
  },
] as const;
