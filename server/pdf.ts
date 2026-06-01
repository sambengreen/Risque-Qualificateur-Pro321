import PDFDocument from "pdfkit";
import { SATIS_CONSEILS } from "@shared/schema";

const BLUE = "#1e3a5f";
const DARK = "#1e293b";
const GRAY = "#4b5563";
const LIGHT_GRAY = "#94a3b8";
const BG_LIGHT = "#f8fafc";

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function safeText(doc: InstanceType<typeof PDFDocument>, str: string, x: number, y: number, opts: any = {}) {
  const h = doc.heightOfString(str, { width: opts.width || 500 });
  doc.text(str, x, y, { ...opts, height: h + 2 });
}

export function generateOrderPDF(order: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      autoFirstPage: false,
      bufferPages: true,
      info: {
        Title: `Bon de commande ${order.orderNumber}`,
        Author: SATIS_CONSEILS.name,
        Subject: "Bon de commande et CGV",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const PW = 595.28;
    const PH = 841.89;
    const M = 40;
    const CW = PW - M * 2;
    const items = order.items as any[];
    const orderDate = new Date(order.createdAt).toLocaleDateString("fr-FR");

    // ===== PAGE 1 : BON DE COMMANDE =====
    doc.addPage({ size: "A4", margins: { top: 0, bottom: 0, left: 0, right: 0 } });

    // En-tete bleu
    doc.rect(0, 0, PW, 60).fill(BLUE);
    doc.font("Helvetica-Bold").fontSize(16).fillColor("#ffffff");
    safeText(doc, SATIS_CONSEILS.name, 0, 14, { width: PW, align: "center" });
    doc.font("Helvetica").fontSize(8).fillColor("#93c5fd");
    safeText(doc, `${SATIS_CONSEILS.forme} - Conseil en securite au travail`, 0, 34, { width: PW, align: "center" });

    // Titre
    doc.font("Helvetica-Bold").fontSize(14).fillColor(BLUE);
    safeText(doc, "BON DE COMMANDE", M, 72, { width: CW, align: "center" });
    doc.font("Helvetica").fontSize(9).fillColor(GRAY);
    safeText(doc, `${order.orderNumber} - ${orderDate}`, M, 90, { width: CW, align: "center" });

    // Blocs Emetteur / Client
    const bTop = 110;
    const bW = (CW - 10) / 2;

    doc.rect(M, bTop, bW, 88).fill(BG_LIGHT);
    doc.font("Helvetica").fontSize(6).fillColor(LIGHT_GRAY);
    safeText(doc, "EMETTEUR", M + 8, bTop + 6, { width: bW - 16 });
    doc.font("Helvetica-Bold").fontSize(9).fillColor(DARK);
    safeText(doc, SATIS_CONSEILS.name, M + 8, bTop + 18, { width: bW - 16 });
    doc.font("Helvetica").fontSize(8).fillColor(GRAY);
    safeText(doc, SATIS_CONSEILS.forme, M + 8, bTop + 30, { width: bW - 16 });
    safeText(doc, SATIS_CONSEILS.address, M + 8, bTop + 40, { width: bW - 16 });
    safeText(doc, `${SATIS_CONSEILS.postalCode} ${SATIS_CONSEILS.city}`, M + 8, bTop + 50, { width: bW - 16 });
    doc.fontSize(7).fillColor(LIGHT_GRAY);
    safeText(doc, `SIRET : ${SATIS_CONSEILS.siret} - TVA : ${SATIS_CONSEILS.tvaIntra}`, M + 8, bTop + 64, { width: bW - 16 });
    safeText(doc, `${SATIS_CONSEILS.rcs} - NAF : ${SATIS_CONSEILS.naf}`, M + 8, bTop + 74, { width: bW - 16 });

    const cX = M + bW + 10;
    doc.rect(cX, bTop, bW, 88).fill(BG_LIGHT);
    doc.font("Helvetica").fontSize(6).fillColor(LIGHT_GRAY);
    safeText(doc, "CLIENT", cX + 8, bTop + 6, { width: bW - 16 });
    doc.font("Helvetica-Bold").fontSize(9).fillColor(DARK);
    safeText(doc, order.companyName || "", cX + 8, bTop + 18, { width: bW - 16 });
    let cy = bTop + 30;
    if (order.companyContactName) {
      doc.font("Helvetica").fontSize(8).fillColor(GRAY);
      safeText(doc, `A l'att. de : ${order.companyContactName}${order.companyContactRole ? ` (${order.companyContactRole})` : ""}`, cX + 8, cy, { width: bW - 16 });
      cy += 10;
    }
    if (order.companyAddress) {
      doc.font("Helvetica").fontSize(8).fillColor(GRAY);
      safeText(doc, order.companyAddress, cX + 8, cy, { width: bW - 16 });
      cy += 10;
    }
    if (order.companyPostalCode || order.companyCity) {
      doc.font("Helvetica").fontSize(8).fillColor(GRAY);
      safeText(doc, `${order.companyPostalCode || ""} ${order.companyCity || ""}`.trim(), cX + 8, cy, { width: bW - 16 });
      cy += 10;
    }
    if (order.companySiret) {
      doc.fontSize(7).fillColor(LIGHT_GRAY);
      safeText(doc, `SIRET : ${order.companySiret}`, cX + 8, cy + 4, { width: bW - 16 });
    }

    // Tableau des prestations
    const tTop = 212;
    doc.rect(M, tTop, CW, 20).fill(BLUE);
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#ffffff");
    safeText(doc, "Description", M + 8, tTop + 6, { width: 240 });
    safeText(doc, "Qte", M + CW - 210, tTop + 6, { width: 40, align: "center" });
    safeText(doc, "Prix unit. HT", M + CW - 155, tTop + 6, { width: 75, align: "right" });
    safeText(doc, "Total HT", M + CW - 68, tTop + 6, { width: 60, align: "right" });

    let rY = tTop + 20;
    items.forEach((item: any, i: number) => {
      if (i % 2 === 0) {
        doc.rect(M, rY, CW, 20).fill("#f9fafb");
      }
      doc.font("Helvetica").fontSize(8).fillColor(DARK);
      safeText(doc, item.description || "", M + 8, rY + 5, { width: 240 });
      safeText(doc, String(item.quantity), M + CW - 210, rY + 5, { width: 40, align: "center" });
      safeText(doc, `${formatCents(item.unitPriceHT)} EUR`, M + CW - 155, rY + 5, { width: 75, align: "right" });
      doc.font("Helvetica-Bold").fontSize(8).fillColor(DARK);
      safeText(doc, `${formatCents(item.totalHT)} EUR`, M + CW - 68, rY + 5, { width: 60, align: "right" });
      doc.moveTo(M, rY + 20).lineTo(M + CW, rY + 20).strokeColor("#e5e7eb").lineWidth(0.5).stroke();
      rY += 20;
    });

    // Totaux
    const tX = M + CW - 180;
    rY += 8;
    doc.font("Helvetica").fontSize(9).fillColor(GRAY);
    safeText(doc, "Total HT", tX, rY, { width: 100 });
    doc.font("Helvetica-Bold").fillColor(DARK);
    safeText(doc, `${formatCents(order.totalHT)} EUR`, tX + 100, rY, { width: 80, align: "right" });
    rY += 15;
    doc.font("Helvetica").fillColor(LIGHT_GRAY);
    safeText(doc, `TVA (${order.tvaRate}%)`, tX, rY, { width: 100 });
    safeText(doc, `${formatCents(order.totalTVA)} EUR`, tX + 100, rY, { width: 80, align: "right" });
    rY += 15;
    doc.moveTo(tX, rY).lineTo(tX + 180, rY).strokeColor(BLUE).lineWidth(1.5).stroke();
    rY += 5;
    doc.font("Helvetica-Bold").fontSize(12).fillColor(BLUE);
    safeText(doc, "Total TTC", tX, rY, { width: 100 });
    safeText(doc, `${formatCents(order.totalTTC)} EUR`, tX + 100, rY, { width: 80, align: "right" });

    // Notes
    if (order.notes && order.notes.trim()) {
      rY += 25;
      doc.roundedRect(M, rY, CW, 32, 3).fill("#fffbeb");
      doc.font("Helvetica-Bold").fontSize(7).fillColor("#92400e");
      safeText(doc, "Notes / Conditions :", M + 8, rY + 6, { width: CW - 16 });
      doc.font("Helvetica").fontSize(7).fillColor("#78350f");
      safeText(doc, order.notes, M + 8, rY + 16, { width: CW - 16 });
      rY += 32;
    }

    // Zone signature + cachet
    rY += 18;
    doc.lineWidth(1).dash(4, { space: 3 }).strokeColor("#d1d5db")
      .rect(M, rY, CW, 120).stroke();
    doc.undash();

    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(DARK);
    safeText(doc, "Signature et cachet du client", M + 12, rY + 8, { width: CW - 24 });
    doc.font("Helvetica").fontSize(7).fillColor(GRAY);
    safeText(doc, "En signant ce bon de commande, le client accepte les prestations decrites ci-dessus ainsi que les Conditions Generales de Vente annexees au present document.", M + 12, rY + 20, { width: CW - 24 });

    const sigBoxY = rY + 38;
    const sigBoxW = (CW - 36) / 2;

    doc.font("Helvetica").fontSize(6).fillColor(LIGHT_GRAY);
    safeText(doc, "SIGNATURE", M + 12, sigBoxY, { width: sigBoxW });
    doc.rect(M + 12, sigBoxY + 10, sigBoxW, 55).strokeColor("#d1d5db").lineWidth(0.5).stroke();
    if (order.signatureData) {
      try {
        doc.image(order.signatureData, M + 14, sigBoxY + 12, { width: sigBoxW - 4, height: 51, fit: [sigBoxW - 4, 51] });
      } catch (_e) {}
    }

    doc.font("Helvetica").fontSize(6).fillColor(LIGHT_GRAY);
    safeText(doc, "CACHET DE LA SOCIETE", M + 24 + sigBoxW, sigBoxY, { width: sigBoxW });
    doc.rect(M + 24 + sigBoxW, sigBoxY + 10, sigBoxW, 55).strokeColor("#d1d5db").lineWidth(0.5).stroke();
    if (order.stampNote) {
      doc.font("Helvetica").fontSize(7).fillColor(DARK);
      safeText(doc, order.stampNote, M + 28 + sigBoxW, sigBoxY + 14, { width: sigBoxW - 8 });
    }

    if (order.validatedAt) {
      doc.font("Helvetica").fontSize(7).fillColor("#166534");
      safeText(doc, `Valide le ${new Date(order.validatedAt).toLocaleDateString("fr-FR")}`, M + 12, rY + 105, { width: CW - 24 });
    }

    // Pied de page 1
    doc.font("Helvetica").fontSize(6.5).fillColor(LIGHT_GRAY);
    safeText(doc, `${SATIS_CONSEILS.name} - ${SATIS_CONSEILS.forme} - ${SATIS_CONSEILS.address}, ${SATIS_CONSEILS.postalCode} ${SATIS_CONSEILS.city} - SIRET ${SATIS_CONSEILS.siret} - TVA ${SATIS_CONSEILS.tvaIntra}`, M, PH - 38, { width: CW, align: "center" });
    safeText(doc, "Voir Conditions Generales de Vente en page suivante", M, PH - 28, { width: CW, align: "center" });


    // ===== PAGE 2 : CONDITIONS GENERALES DE VENTE =====
    doc.addPage({ size: "A4", margins: { top: 0, bottom: 0, left: 0, right: 0 } });

    const M2 = 30;
    const CW2 = PW - M2 * 2;
    const TF = 5.8;
    const BF = 5.5;
    const GX = 12;
    const GY = 3;
    const COL = (CW2 - GX) / 2;

    // Titre CGV
    doc.font("Helvetica-Bold").fontSize(8).fillColor(DARK);
    safeText(doc, "CONDITIONS GENERALES DE VENTE", M2, 10, { width: CW2, align: "center" });
    doc.font("Helvetica").fontSize(5.5).fillColor(LIGHT_GRAY);
    safeText(doc, `${SATIS_CONSEILS.name} - ${SATIS_CONSEILS.forme} - SIRET ${SATIS_CONSEILS.siret}`, M2, 22, { width: CW2, align: "center" });
    doc.moveTo(M2, 30).lineTo(M2 + CW2, 30).strokeColor("#e5e7eb").lineWidth(0.5).stroke();

    const cgv: [string, string][] = [
      ["Article 1 - Objet et champ d'application",
       `Les presentes Conditions Generales de Vente (CGV) s'appliquent a toutes les prestations de conseil en prevention des risques professionnels et d'etablissement du Document Unique d'Evaluation des Risques Professionnels (DUERP) realisees par ${SATIS_CONSEILS.name}, ${SATIS_CONSEILS.forme}, dont le siege social est situe ${SATIS_CONSEILS.address}, ${SATIS_CONSEILS.postalCode} ${SATIS_CONSEILS.city}, immatriculee au ${SATIS_CONSEILS.rcs} sous le SIRET ${SATIS_CONSEILS.siret}. Toute commande implique l'acceptation sans reserve des presentes CGV.`],
      ["Article 2 - Prestations",
       `Les prestations proposees comprennent : l'etablissement du DUERP conformement aux articles R.4121-1 et suivants du Code du travail, la mise a jour annuelle du DUERP, l'evaluation des risques selon la methodologie INRS ED 840 et les questionnaires OiRA, l'elaboration du plan d'action de prevention associe, et le conseil en prevention des risques professionnels. Le contenu detaille est precise dans le bon de commande signe par le client.`],
      ["Article 3 - Tarifs et devis",
       `Les prix sont exprimes en euros hors taxes (HT). La TVA au taux en vigueur (20%) sera ajoutee. Tarifs : Etablissement du DUERP : 900,00 EUR HT ; Mise a jour annuelle : 200,00 EUR HT. ${SATIS_CONSEILS.name} se reserve le droit de modifier ses tarifs. Les prestations sont facturees sur la base des tarifs en vigueur au jour de la commande.`],
      ["Article 4 - Commande et acceptation",
       `Toute commande est formalisee par la signature du bon de commande accompagne de la mention "Bon pour Accord", de la signature et du cachet du client. La commande ne devient definitive qu'apres acceptation expresse par ${SATIS_CONSEILS.name}. Aucune commande ne pourra etre annulee apres acceptation, sauf accord ecrit.`],
      ["Article 5 - Execution des prestations",
       `${SATIS_CONSEILS.name} s'engage a executer les prestations avec diligence et selon les regles de l'art, conformement aux normes en vigueur (INRS, OiRA). Les delais d'execution sont indicatifs sauf stipulation contraire. Le client s'engage a fournir toutes les informations et documents necessaires et a faciliter l'acces aux locaux le cas echeant.`],
      ["Article 6 - Facturation et paiement",
       `La facture est emise a la validation du bon de commande. Le delai de paiement est de trente (30) jours a compter de la date d'emission de la facture, conformement a l'article L.441-10 du Code de commerce. Paiements acceptes par virement bancaire ou cheque a l'ordre de ${SATIS_CONSEILS.name}.`],
      ["Article 7 - Penalites de retard",
       `En cas de retard de paiement, des penalites seront exigibles de plein droit au taux de trois (3) fois le taux d'interet legal (art. L.441-10 du Code de commerce). Une indemnite forfaitaire de quarante (40) euros pour frais de recouvrement sera due de plein droit (art. D.441-5 du Code de commerce).`],
      ["Article 8 - Propriete intellectuelle",
       `Les documents, rapports et DUERP produits restent la propriete intellectuelle de ${SATIS_CONSEILS.name} jusqu'au paiement integral. Apres paiement complet, le client devient proprietaire du DUERP et des documents associes pour un usage interne exclusif.`],
      ["Article 9 - Confidentialite",
       `${SATIS_CONSEILS.name} s'engage a traiter comme confidentielles toutes les informations communiquees par le client. Cette obligation perdure pendant toute la duree du contrat et cinq (5) ans apres son terme.`],
      ["Article 10 - Responsabilite",
       `${SATIS_CONSEILS.name} est soumise a une obligation de moyens. Sa responsabilite ne saurait etre engagee en cas de non-respect par le client de ses obligations legales ni en cas d'informations erronees fournies par le client. La responsabilite est limitee au montant de la prestation facturee.`],
      ["Article 11 - Force majeure",
       `Aucune partie ne sera tenue responsable de l'inexecution de ses obligations en cas de force majeure (art. 1218 du Code civil). La partie invoquant la force majeure en informera l'autre dans les meilleurs delais.`],
      ["Article 12 - Protection des donnees personnelles",
       `Conformement au RGPD et a la loi Informatique et Libertes, ${SATIS_CONSEILS.name} protege les donnees personnelles collectees. Les donnees sont traitees aux seules fins de l'execution du contrat et de la gestion commerciale. Le client dispose d'un droit d'acces, de rectification, de suppression et de portabilite de ses donnees.`],
      ["Article 13 - Resiliation",
       `En cas de manquement grave, l'autre partie pourra resilier le contrat de plein droit par lettre recommandee avec accuse de reception, apres mise en demeure restee sans effet pendant quinze (15) jours.`],
      ["Article 14 - Droit applicable et litiges",
       `Les presentes CGV sont regies par le droit francais. En cas de litige, les parties rechercheront une solution amiable. A defaut sous trente (30) jours, le litige sera soumis a la competence exclusive du Tribunal de Commerce de Paris.`],
    ];

    // Grille 2 colonnes comme l'app (grid-cols-2) : art pairs en lignes
    let gridY = 36;
    for (let i = 0; i < cgv.length; i += 2) {
      const [lTitle, lBody] = cgv[i];
      const rArt = cgv[i + 1];

      // Calculer hauteurs
      const ltH = doc.font("Helvetica-Bold").fontSize(TF).heightOfString(lTitle, { width: COL });
      const lbH = doc.font("Helvetica").fontSize(BF).heightOfString(lBody, { width: COL });
      const leftH = ltH + lbH + 2;

      let rightH = 0;
      let rtH = 0;
      let rbH = 0;
      if (rArt) {
        rtH = doc.font("Helvetica-Bold").fontSize(TF).heightOfString(rArt[0], { width: COL });
        rbH = doc.font("Helvetica").fontSize(BF).heightOfString(rArt[1], { width: COL });
        rightH = rtH + rbH + 2;
      }

      const rowH = Math.max(leftH, rightH);

      // Gauche
      doc.font("Helvetica-Bold").fontSize(TF).fillColor(DARK);
      safeText(doc, lTitle, M2, gridY, { width: COL });
      doc.font("Helvetica").fontSize(BF).fillColor(GRAY);
      safeText(doc, lBody, M2, gridY + ltH + 1, { width: COL });

      // Droite
      if (rArt) {
        doc.font("Helvetica-Bold").fontSize(TF).fillColor(DARK);
        safeText(doc, rArt[0], M2 + COL + GX, gridY, { width: COL });
        doc.font("Helvetica").fontSize(BF).fillColor(GRAY);
        safeText(doc, rArt[1], M2 + COL + GX, gridY + rtH + 1, { width: COL });
      }

      gridY += rowH + GY;
    }

    // Separateur + pied CGV
    doc.moveTo(M2, gridY + 2).lineTo(M2 + CW2, gridY + 2).strokeColor("#e5e7eb").lineWidth(0.5).stroke();
    doc.font("Helvetica-Bold").fontSize(5.5).fillColor(LIGHT_GRAY);
    safeText(doc, `${SATIS_CONSEILS.name} - ${SATIS_CONSEILS.forme}`, M2, gridY + 6, { width: CW2, align: "center" });
    doc.font("Helvetica").fontSize(5).fillColor(LIGHT_GRAY);
    safeText(doc, `${SATIS_CONSEILS.address}, ${SATIS_CONSEILS.postalCode} ${SATIS_CONSEILS.city}`, M2, gridY + 14, { width: CW2, align: "center" });
    safeText(doc, `SIRET : ${SATIS_CONSEILS.siret} - TVA Intra. : ${SATIS_CONSEILS.tvaIntra} - ${SATIS_CONSEILS.rcs} - NAF : ${SATIS_CONSEILS.naf}`, M2, gridY + 21, { width: CW2, align: "center" });

    // S'assurer qu'on ne garde que 2 pages
    const range = doc.bufferedPageRange();
    if (range.count > 2) {
      for (let p = 0; p < 2; p++) {
        doc.switchToPage(p);
      }
    }

    doc.end();
  });
}
