import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCompanySchema, insertAssessmentSchema, insertRiskEvaluationSchema, insertQuestionResponseSchema, insertOrderSchema, insertInvoiceSchema, insertUserSchema, SATIS_CONSEILS } from "@shared/schema";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { getResendClient } from "./email";
import { generateOrderPDF } from "./pdf";
import { ensureAuthenticated, requireAdmin, hashPassword } from "./auth";
import passport from "passport";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Identifiant ou mot de passe incorrect" });
      req.logIn(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Erreur lors de la deconnexion" });
      res.json({ message: "Deconnexion reussie" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    return res.status(401).json({ message: "Non authentifie" });
  });

  app.get("/api/companies", ensureAuthenticated, async (req, res) => {
    const user = req.user!;
    const companiesList = user.role === "admin"
      ? await storage.getCompanies()
      : await storage.getCompaniesByUser(user.id);
    res.json(companiesList);
  });

  app.get("/api/companies/:id", ensureAuthenticated, async (req, res) => {
    const company = await storage.getCompany(req.params.id);
    if (!company) return res.status(404).json({ message: "Entreprise non trouvee" });
    if (req.user!.role !== "admin" && company.userId !== req.user!.id) {
      return res.status(403).json({ message: "Acces non autorise" });
    }
    res.json(company);
  });

  app.post("/api/companies", ensureAuthenticated, async (req, res) => {
    const body = { ...req.body, userId: req.user!.id };
    const parsed = insertCompanySchema.safeParse(body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const company = await storage.createCompany(parsed.data);
    res.status(201).json(company);
  });

  app.patch("/api/companies/:id", ensureAuthenticated, async (req, res) => {
    const existing = await storage.getCompany(req.params.id);
    if (!existing) return res.status(404).json({ message: "Entreprise non trouvee" });
    if (req.user!.role !== "admin" && existing.userId !== req.user!.id) {
      return res.status(403).json({ message: "Acces non autorise" });
    }
    const company = await storage.updateCompany(req.params.id, req.body);
    res.json(company);
  });

  app.delete("/api/companies/:id", ensureAuthenticated, async (req, res) => {
    const existing = await storage.getCompany(req.params.id);
    if (!existing) return res.status(404).json({ message: "Entreprise non trouvee" });
    if (req.user!.role !== "admin" && existing.userId !== req.user!.id) {
      return res.status(403).json({ message: "Acces non autorise" });
    }
    await storage.deleteCompany(req.params.id);
    res.status(204).send();
  });

  app.get("/api/sectors", async (_req, res) => {
    const sectors = await storage.getSectors();
    res.json(sectors);
  });

  app.get("/api/sectors/:id", async (req, res) => {
    const sector = await storage.getSector(req.params.id);
    if (!sector) return res.status(404).json({ message: "Secteur non trouve" });
    res.json(sector);
  });

  app.get("/api/sectors/:id/questions", async (req, res) => {
    const questions = await storage.getSectorQuestions(req.params.id);
    res.json(questions);
  });

  app.get("/api/risk-categories", async (_req, res) => {
    const categories = await storage.getRiskCategories();
    res.json(categories);
  });

  app.get("/api/risk-categories/:id", async (req, res) => {
    const category = await storage.getRiskCategory(req.params.id);
    if (!category) return res.status(404).json({ message: "Categorie non trouvee" });
    res.json(category);
  });

  app.get("/api/assessments", ensureAuthenticated, async (req, res) => {
    const user = req.user!;
    const assessmentList = user.role === "admin"
      ? await storage.getAssessments()
      : await storage.getAssessmentsByUser(user.id);
    res.json(assessmentList);
  });

  app.get("/api/assessments/:id", ensureAuthenticated, async (req, res) => {
    const assessment = await storage.getAssessment(req.params.id);
    if (!assessment) return res.status(404).json({ message: "Evaluation non trouvee" });
    if (req.user!.role !== "admin" && assessment.userId !== req.user!.id) {
      return res.status(403).json({ message: "Acces non autorise" });
    }
    res.json(assessment);
  });

  app.get("/api/companies/:id/assessments", ensureAuthenticated, async (req, res) => {
    const assessmentList = await storage.getAssessmentsByCompany(req.params.id);
    if (req.user!.role !== "admin") {
      const filtered = assessmentList.filter(a => a.userId === req.user!.id);
      return res.json(filtered);
    }
    res.json(assessmentList);
  });

  app.post("/api/assessments", ensureAuthenticated, async (req, res) => {
    const body = { ...req.body, userId: req.user!.id };
    if (typeof body.date === "string") {
      body.date = new Date(body.date);
    }
    const parsed = insertAssessmentSchema.safeParse(body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const assessment = await storage.createAssessment(parsed.data);
    res.status(201).json(assessment);
  });

  app.patch("/api/assessments/:id", ensureAuthenticated, async (req, res) => {
    const assessment = await storage.updateAssessment(req.params.id, req.body);
    if (!assessment) return res.status(404).json({ message: "Evaluation non trouvee" });
    res.json(assessment);
  });

  app.delete("/api/assessments/:id", ensureAuthenticated, async (req, res) => {
    await storage.deleteAssessment(req.params.id);
    res.status(204).send();
  });

  app.get("/api/assessments/:id/evaluations", ensureAuthenticated, async (req, res) => {
    const evaluations = await storage.getRiskEvaluations(req.params.id);
    res.json(evaluations);
  });

  app.post("/api/evaluations", ensureAuthenticated, async (req, res) => {
    const parsed = insertRiskEvaluationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const evaluation = await storage.createRiskEvaluation(parsed.data);
    res.status(201).json(evaluation);
  });

  app.patch("/api/evaluations/:id", ensureAuthenticated, async (req, res) => {
    const evaluation = await storage.updateRiskEvaluation(req.params.id, req.body);
    if (!evaluation) return res.status(404).json({ message: "Evaluation non trouvee" });
    res.json(evaluation);
  });

  app.get("/api/assessments/:id/responses", ensureAuthenticated, async (req, res) => {
    const responses = await storage.getQuestionResponses(req.params.id);
    res.json(responses);
  });

  app.post("/api/responses", ensureAuthenticated, async (req, res) => {
    const parsed = insertQuestionResponseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const response = await storage.createQuestionResponse(parsed.data);
    res.status(201).json(response);
  });

  app.patch("/api/responses/:id", ensureAuthenticated, async (req, res) => {
    const response = await storage.updateQuestionResponse(req.params.id, req.body);
    if (!response) return res.status(404).json({ message: "Reponse non trouvee" });
    res.json(response);
  });

  app.delete("/api/responses/:id", ensureAuthenticated, async (req, res) => {
    await storage.deleteQuestionResponse(req.params.id);
    res.status(204).send();
  });

  app.get("/api/siret-lookup/:siret", async (req, res) => {
    const siret = req.params.siret.replace(/\s/g, "");
    if (!/^\d{14}$/.test(siret)) {
      return res.status(400).json({ message: "Le SIRET doit contenir 14 chiffres" });
    }
    try {
      const response = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${siret}`, {
        headers: {
          "User-Agent": "SatisConsulting-DUERP/1.0 (contact@satisconseils.fr)",
          "Accept": "application/json",
        },
      });
      if (response.status === 429) {
        return res.status(429).json({ message: "Service SIRET temporairement indisponible, veuillez reessayer dans quelques secondes" });
      }
      if (!response.ok) {
        return res.status(502).json({ message: "Erreur lors de la recherche SIRET (code " + response.status + ")" });
      }
      const data = await response.json() as any;
      const result = data.results?.[0];
      if (!result) {
        return res.status(404).json({ message: "Aucune entreprise trouvee pour ce SIRET" });
      }
      const siege = result.siege || {};
      const effectifMap: Record<string, number> = {
        "00": 0, "01": 2, "02": 5, "03": 9, "11": 15, "12": 30, "21": 75,
        "22": 150, "31": 350, "32": 750, "41": 3500, "42": 7500, "51": 7500, "52": 7500,
      };
      const effectif = effectifMap[result.tranche_effectif_salarie] || 0;
      res.json({
        name: result.nom_complet || "",
        siret: siege.siret || siret,
        address: siege.geo_adresse?.split(/\d{5}/)?.[0]?.trim() || `${siege.numero_voie || ""} ${siege.type_voie || ""} ${siege.libelle_voie || ""}`.trim(),
        city: siege.libelle_commune || "",
        postalCode: siege.code_postal || "",
        employeeCount: effectif,
        naf: result.activite_principale || "",
      });
    } catch (err) {
      res.status(502).json({ message: "Impossible de contacter le service SIRET" });
    }
  });

  app.get("/api/prevention-resources", async (req, res) => {
    const category = req.query.category as string | undefined;
    if (category) {
      const resources = await storage.getPreventionResourcesByCategory(category);
      return res.json(resources);
    }
    const resources = await storage.getPreventionResources();
    res.json(resources);
  });

  app.get("/api/prevention-resources/search", async (req, res) => {
    const q = (req.query.q as string || "").trim().toLowerCase();
    if (!q) return res.json([]);
    const resources = await storage.getPreventionResources();
    const keywords = q.split(/\s+/).filter(Boolean);
    const scored = resources.map(r => {
      const searchableText = [
        r.edNumber, r.title, r.sector, r.category, r.summary || "",
        ...(Array.isArray(r.keyStats) ? r.keyStats : []),
        ...(Array.isArray(r.mainRisks) ? r.mainRisks : []),
        ...(Array.isArray(r.preventionActions) ? r.preventionActions : []),
        ...(Array.isArray(r.supportActors) ? r.supportActors : []),
        ...(Array.isArray(r.employeeSteps) ? r.employeeSteps : []),
        ...(Array.isArray(r.references) ? r.references : []),
      ].join(" ").toLowerCase();
      let score = 0;
      const matchedFields: string[] = [];
      for (const kw of keywords) {
        if (searchableText.includes(kw)) score += 1;
        if (r.title.toLowerCase().includes(kw)) { score += 3; matchedFields.push("title"); }
        if (r.edNumber.toLowerCase().includes(kw)) { score += 3; matchedFields.push("edNumber"); }
        if (r.category.toLowerCase().includes(kw)) { score += 2; matchedFields.push("category"); }
        if (r.sector.toLowerCase().includes(kw)) { score += 2; matchedFields.push("sector"); }
        if (r.summary?.toLowerCase().includes(kw)) { score += 1; matchedFields.push("summary"); }
        const risksText = (Array.isArray(r.mainRisks) ? r.mainRisks : []).join(" ").toLowerCase();
        if (risksText.includes(kw)) { score += 1; matchedFields.push("mainRisks"); }
        const actionsText = (Array.isArray(r.preventionActions) ? r.preventionActions : []).join(" ").toLowerCase();
        if (actionsText.includes(kw)) { score += 1; matchedFields.push("preventionActions"); }
      }
      return { ...r, _score: score, _matchedFields: [...new Set(matchedFields)] };
    }).filter(r => r._score > 0).sort((a, b) => b._score - a._score);
    res.json(scored);
  });

  app.get("/api/prevention-resources/:id", async (req, res) => {
    const resource = await storage.getPreventionResource(req.params.id);
    if (!resource) return res.status(404).json({ message: "Ressource non trouvee" });
    res.json(resource);
  });

  app.patch("/api/prevention-resources/:id", async (req, res) => {
    const existing = await storage.getPreventionResource(req.params.id);
    if (!existing) return res.status(404).json({ message: "Ressource non trouvee" });
    const updated = await storage.updatePreventionResource(req.params.id, req.body);
    res.json(updated);
  });

  const pdfsDir = path.resolve(process.cwd(), "public/pdfs");
  app.get("/api/pdfs/:filename", (req, res) => {
    const filename = req.params.filename;
    if (!/^[\w\-().]+\.pdf$/i.test(filename)) {
      return res.status(400).json({ message: "Nom de fichier invalide" });
    }
    const filePath = path.join(pdfsDir, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Fichier PDF non trouve" });
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    fs.createReadStream(filePath).pipe(res);
  });

  app.get("/api/pdfs", (_req, res) => {
    if (!fs.existsSync(pdfsDir)) return res.json([]);
    const files = fs.readdirSync(pdfsDir).filter(f => f.endsWith(".pdf"));
    res.json(files);
  });

  app.get("/api/orders", ensureAuthenticated, async (req, res) => {
    const user = req.user!;
    const orderList = user.role === "admin"
      ? await storage.getOrders()
      : await storage.getOrdersByUser(user.id);
    res.json(orderList);
  });

  app.get("/api/orders/:id", ensureAuthenticated, async (req, res) => {
    const order = await storage.getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "Bon de commande non trouve" });
    if (req.user!.role !== "admin" && order.userId !== req.user!.id) {
      return res.status(403).json({ message: "Acces non autorise" });
    }
    res.json(order);
  });

  app.post("/api/orders", ensureAuthenticated, async (req, res) => {
    const body = { ...req.body, userId: req.user!.id };
    if (typeof body.validatedAt === "string") body.validatedAt = new Date(body.validatedAt);
    const existingOrders = await storage.getOrders();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const prefix = `BC-${year}-${month}-`;
    let maxNum = 0;
    for (const o of existingOrders) {
      if (o.orderNumber.startsWith(prefix)) {
        const num = parseInt(o.orderNumber.slice(prefix.length), 10);
        if (num > maxNum) maxNum = num;
      }
    }
    body.orderNumber = `${prefix}${String(maxNum + 1).padStart(4, "0")}`;
    const parsed = insertOrderSchema.safeParse(body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const order = await storage.createOrder(parsed.data);
    res.status(201).json(order);
  });

  app.patch("/api/orders/:id", ensureAuthenticated, async (req, res) => {
    const body = { ...req.body };
    if (typeof body.validatedAt === "string") body.validatedAt = new Date(body.validatedAt);
    const order = await storage.updateOrder(req.params.id, body);
    if (!order) return res.status(404).json({ message: "Bon de commande non trouve" });
    res.json(order);
  });

  app.delete("/api/orders/:id", ensureAuthenticated, async (req, res) => {
    await storage.deleteOrder(req.params.id);
    res.status(204).send();
  });

  app.post("/api/orders/:id/validate", ensureAuthenticated, async (req, res) => {
    const order = await storage.getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "Bon de commande non trouve" });
    if (order.status === "validated") return res.status(400).json({ message: "Deja valide" });
    const updated = await storage.updateOrder(req.params.id, {
      status: "validated",
      validatedAt: new Date(),
      signatureData: req.body.signatureData || order.signatureData,
      stampNote: req.body.stampNote || order.stampNote,
    });
    const existingInvoices = await storage.getInvoices();
    const invNow = new Date();
    const invYear = invNow.getFullYear();
    const invMonth = String(invNow.getMonth() + 1).padStart(2, "0");
    const invPrefix = `FA-${invYear}-${invMonth}-`;
    let maxInvNum = 0;
    for (const inv of existingInvoices) {
      if (inv.invoiceNumber.startsWith(invPrefix)) {
        const num = parseInt(inv.invoiceNumber.slice(invPrefix.length), 10);
        if (num > maxInvNum) maxInvNum = num;
      }
    }
    const invoice = await storage.createInvoice({
      invoiceNumber: `${invPrefix}${String(maxInvNum + 1).padStart(4, "0")}`,
      orderId: order.id,
      companyId: order.companyId,
      companyName: order.companyName,
      companySiret: order.companySiret,
      companyAddress: order.companyAddress,
      companyCity: order.companyCity,
      companyPostalCode: order.companyPostalCode,
      companyContactName: order.companyContactName,
      companyEmail: order.companyEmail,
      items: order.items,
      totalHT: order.totalHT,
      tvaRate: order.tvaRate,
      totalTVA: order.totalTVA,
      totalTTC: order.totalTTC,
      status: "emise",
      notes: order.notes,
      userId: order.userId,
    });
    res.json({ order: updated, invoice });
  });

  app.get("/api/invoices", ensureAuthenticated, async (req, res) => {
    const user = req.user!;
    const invoiceList = user.role === "admin"
      ? await storage.getInvoices()
      : await storage.getInvoicesByUser(user.id);
    res.json(invoiceList);
  });

  app.get("/api/invoices/:id", ensureAuthenticated, async (req, res) => {
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Facture non trouvee" });
    res.json(invoice);
  });

  app.patch("/api/invoices/:id", ensureAuthenticated, async (req, res) => {
    const body = { ...req.body };
    if (typeof body.paidAt === "string") body.paidAt = new Date(body.paidAt);
    const invoice = await storage.updateInvoice(req.params.id, body);
    if (!invoice) return res.status(404).json({ message: "Facture non trouvee" });
    res.json(invoice);
  });

  app.post("/api/orders/:id/send-email", ensureAuthenticated, async (req, res) => {
    try {
      const emailSchema = z.object({ email: z.string().email("Adresse email invalide") });
      const order = await storage.getOrder(req.params.id);
      if (!order) return res.status(404).json({ message: "Bon de commande non trouve" });

      const rawEmail = req.body.email || order.companyEmail;
      if (!rawEmail) {
        return res.status(400).json({ message: "Aucune adresse email renseignee pour ce client" });
      }
      const emailParsed = emailSchema.safeParse({ email: rawEmail });
      if (!emailParsed.success) {
        return res.status(400).json({ message: "Adresse email invalide" });
      }
      const recipientEmail = emailParsed.data.email;

      const esc = (s: string | null | undefined) =>
        (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

      const formatCents = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");
      const items = order.items as any[];
      const orderDate = new Date(order.createdAt).toLocaleDateString("fr-FR");

      const itemsRows = items.map((item: any) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">${esc(item.description)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:13px;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px;">${formatCents(item.unitPriceHT)} EUR</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px;font-weight:600;">${formatCents(item.totalHT)} EUR</td>
        </tr>`
      ).join("");

      const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background-color:#f5f5f5;">
  <div style="max-width:680px;margin:0 auto;background:#ffffff;">
    <div style="background:#1e3a5f;padding:24px 32px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:20px;letter-spacing:1px;">${SATIS_CONSEILS.name}</h1>
      <p style="color:#93c5fd;margin:4px 0 0;font-size:12px;">${SATIS_CONSEILS.forme} - Conseil en securite au travail</p>
    </div>
    <div style="padding:24px 32px;">
      <div style="text-align:center;margin-bottom:20px;">
        <h2 style="color:#1e3a5f;margin:0;font-size:18px;">BON DE COMMANDE</h2>
        <p style="color:#6b7280;margin:4px 0 0;font-size:13px;">${order.orderNumber} - ${orderDate}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="width:50%;vertical-align:top;padding:12px;background:#f8fafc;border-radius:6px;">
            <p style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Emetteur</p>
            <p style="margin:0;font-weight:700;font-size:14px;color:#1e293b;">${SATIS_CONSEILS.name}</p>
            <p style="margin:2px 0;font-size:12px;color:#4b5563;">${SATIS_CONSEILS.address}</p>
            <p style="margin:2px 0;font-size:12px;color:#4b5563;">${SATIS_CONSEILS.postalCode} ${SATIS_CONSEILS.city}</p>
            <p style="margin:6px 0 2px;font-size:11px;color:#6b7280;">SIRET : ${SATIS_CONSEILS.siret}</p>
            <p style="margin:2px 0;font-size:11px;color:#6b7280;">TVA : ${SATIS_CONSEILS.tvaIntra}</p>
          </td>
          <td style="width:8px;"></td>
          <td style="width:50%;vertical-align:top;padding:12px;background:#f8fafc;border-radius:6px;">
            <p style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Client</p>
            <p style="margin:0;font-weight:700;font-size:14px;color:#1e293b;">${esc(order.companyName)}</p>
            ${order.companyContactName ? `<p style="margin:2px 0;font-size:12px;color:#4b5563;">A l'attention de : ${esc(order.companyContactName)}${order.companyContactRole ? ` (${esc(order.companyContactRole)})` : ""}</p>` : ""}
            ${order.companyAddress ? `<p style="margin:2px 0;font-size:12px;color:#4b5563;">${esc(order.companyAddress)}</p>` : ""}
            ${(order.companyPostalCode || order.companyCity) ? `<p style="margin:2px 0;font-size:12px;color:#4b5563;">${esc(order.companyPostalCode)} ${esc(order.companyCity)}</p>` : ""}
            ${order.companySiret ? `<p style="margin:6px 0 2px;font-size:11px;color:#6b7280;">SIRET : ${esc(order.companySiret)}</p>` : ""}
          </td>
        </tr>
      </table>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <thead>
          <tr style="background:#1e3a5f;">
            <th style="padding:10px 12px;text-align:left;color:#ffffff;font-size:12px;font-weight:600;">Description</th>
            <th style="padding:10px 12px;text-align:center;color:#ffffff;font-size:12px;font-weight:600;width:60px;">Qte</th>
            <th style="padding:10px 12px;text-align:right;color:#ffffff;font-size:12px;font-weight:600;width:110px;">Prix unit. HT</th>
            <th style="padding:10px 12px;text-align:right;color:#ffffff;font-size:12px;font-weight:600;width:110px;">Total HT</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
      <table style="width:240px;margin-left:auto;border-collapse:collapse;">
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#4b5563;">Total HT</td>
          <td style="padding:4px 0;font-size:13px;text-align:right;font-weight:600;">${formatCents(order.totalHT)} EUR</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#6b7280;">TVA (${order.tvaRate}%)</td>
          <td style="padding:4px 0;font-size:13px;text-align:right;color:#6b7280;">${formatCents(order.totalTVA)} EUR</td>
        </tr>
        <tr>
          <td style="padding:8px 0 4px;font-size:15px;font-weight:700;color:#1e293b;border-top:2px solid #1e3a5f;">Total TTC</td>
          <td style="padding:8px 0 4px;font-size:15px;text-align:right;font-weight:700;color:#1e3a5f;border-top:2px solid #1e3a5f;">${formatCents(order.totalTTC)} EUR</td>
        </tr>
      </table>
      ${order.notes ? `
      <div style="margin-top:16px;padding:12px;background:#fffbeb;border-radius:6px;border:1px solid #fde68a;">
        <p style="font-size:11px;font-weight:600;color:#92400e;margin:0 0 4px;">Notes / Conditions :</p>
        <p style="font-size:12px;color:#78350f;margin:0;white-space:pre-wrap;">${esc(order.notes)}</p>
      </div>` : ""}
      <div style="margin-top:20px;padding:16px;background:#f0fdf4;border-radius:6px;border:1px solid #bbf7d0;text-align:center;">
        <p style="font-size:13px;color:#166534;margin:0;font-weight:600;">
          Pour valider ce bon de commande, merci de nous le retourner signe avec la mention "Bon pour Accord" et le cachet de votre societe.
        </p>
      </div>
    </div>

    <div style="padding:16px 32px;background:#e0f2fe;border-top:3px solid #1e3a5f;text-align:center;">
      <p style="font-size:13px;color:#0c4a6e;margin:0;font-weight:600;">
        Le bon de commande et les Conditions Generales de Vente sont joints a cet email en piece jointe PDF (2 pages).
      </p>
    </div>

    <div style="background:#f1f5f9;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="font-size:10px;color:#94a3b8;margin:0;">
        ${SATIS_CONSEILS.name} - ${SATIS_CONSEILS.forme} - ${SATIS_CONSEILS.address}, ${SATIS_CONSEILS.postalCode} ${SATIS_CONSEILS.city}
      </p>
      <p style="font-size:10px;color:#94a3b8;margin:2px 0 0;">
        SIRET ${SATIS_CONSEILS.siret} - TVA ${SATIS_CONSEILS.tvaIntra} - ${SATIS_CONSEILS.rcs} - NAF ${SATIS_CONSEILS.naf}
      </p>
    </div>
  </div>
</body>
</html>`;

      const pdfBuffer = await generateOrderPDF(order);
      const pdfBase64 = pdfBuffer.toString("base64");

      const { client, fromEmail } = await getResendClient();
      console.log("[EMAIL] Envoi depuis:", fromEmail, "vers:", recipientEmail, "avec PDF");
      const result = await client.emails.send({
        from: fromEmail,
        to: recipientEmail,
        subject: `${SATIS_CONSEILS.name} - Bon de commande ${order.orderNumber}`,
        html: htmlContent,
        attachments: [
          {
            filename: `BDC_${order.orderNumber.replace(/\s+/g, "_")}.pdf`,
            content: pdfBase64,
          },
        ],
      });
      console.log("[EMAIL] Resultat Resend:", JSON.stringify(result));

      if (result.error) {
        console.error("[EMAIL] Erreur Resend:", result.error);
        return res.status(400).json({ message: `Erreur Resend: ${result.error.message}` });
      }

      res.json({ success: true, message: `Email envoye a ${recipientEmail}`, emailId: result.data?.id });
    } catch (err: any) {
      console.error("Erreur envoi email:", err);
      res.status(500).json({ message: err.message || "Erreur lors de l'envoi de l'email" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    const allUsers = await storage.getAllUsers();
    const safeUsers = allUsers.map(u => ({ ...u, password: undefined }));
    res.json(safeUsers);
  });

  app.get("/api/admin/users/:id", requireAdmin, async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouve" });
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    const schema = z.object({
      username: z.string().min(3, "Identifiant trop court"),
      password: z.string().min(4, "Mot de passe trop court"),
      fullName: z.string().min(1, "Nom complet requis"),
      role: z.enum(["commercial", "admin"]).default("commercial"),
      email: z.string().email().optional().nullable(),
      phone: z.string().optional().nullable(),
      region: z.string().optional().nullable(),
      isActive: z.boolean().default(true),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0]?.message || "Donnees invalides" });
    const existing = await storage.getUserByUsername(parsed.data.username);
    if (existing) return res.status(409).json({ message: "Cet identifiant est deja utilise" });
    const hashedPw = await hashPassword(parsed.data.password);
    const user = await storage.createUser({
      ...parsed.data,
      password: hashedPw,
    });
    const { password, ...safeUser } = user;
    res.status(201).json(safeUser);
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    const data = { ...req.body };
    if (data.password) {
      data.password = await hashPassword(data.password);
    } else {
      delete data.password;
    }
    const user = await storage.updateUser(req.params.id, data);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouve" });
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    if (req.params.id === req.user!.id) {
      return res.status(400).json({ message: "Impossible de supprimer votre propre compte" });
    }
    await storage.deleteUser(req.params.id);
    res.status(204).send();
  });

  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    const allUsers = await storage.getAllUsers();
    const allCompanies = await storage.getCompanies();
    const allOrders = await storage.getOrders();
    const allInvoices = await storage.getInvoices();

    const commercials = allUsers.filter(u => u.role === "commercial");

    const commercialStats = commercials.map(com => {
      const userCompanies = allCompanies.filter(c => c.userId === com.id);
      const prospects = userCompanies.filter(c => c.status === "prospect");
      const clients = userCompanies.filter(c => c.status === "client");
      const userOrders = allOrders.filter(o => o.userId === com.id);
      const validatedOrders = userOrders.filter(o => o.status === "validated");
      const userInvoices = allInvoices.filter(i => i.userId === com.id);
      const paidInvoices = userInvoices.filter(i => i.status === "payee");
      const totalCA = validatedOrders.reduce((s, o) => s + o.totalTTC, 0);
      const totalPaid = paidInvoices.reduce((s, i) => s + i.totalTTC, 0);

      const cityCounts: Record<string, number> = {};
      for (const o of validatedOrders) {
        const city = o.companyCity || "Non renseigne";
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      }

      return {
        userId: com.id,
        username: com.username,
        fullName: com.fullName,
        region: com.region,
        isActive: com.isActive,
        totalCompanies: userCompanies.length,
        totalProspects: prospects.length,
        totalClients: clients.length,
        totalOrders: userOrders.length,
        validatedOrders: validatedOrders.length,
        totalCA,
        totalPaid,
        totalUnpaid: totalCA - totalPaid,
        geoDistribution: cityCounts,
      };
    });

    const totalCA = allOrders.filter(o => o.status === "validated").reduce((s, o) => s + o.totalTTC, 0);
    const totalProspects = allCompanies.filter(c => c.status === "prospect").length;
    const totalClients = allCompanies.filter(c => c.status === "client").length;

    const geoCounts: Record<string, number> = {};
    for (const o of allOrders.filter(o => o.status === "validated")) {
      const city = o.companyCity || "Non renseigne";
      geoCounts[city] = (geoCounts[city] || 0) + 1;
    }

    res.json({
      summary: {
        totalCommercials: commercials.length,
        activeCommercials: commercials.filter(c => c.isActive).length,
        totalCompanies: allCompanies.length,
        totalProspects,
        totalClients,
        totalOrders: allOrders.length,
        validatedOrders: allOrders.filter(o => o.status === "validated").length,
        totalCA,
        geoDistribution: geoCounts,
      },
      commercials: commercialStats,
    });
  });

  return httpServer;
}
