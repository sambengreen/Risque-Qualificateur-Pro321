import { Separator } from "@/components/ui/separator";
import { SATIS_CONSEILS } from "@shared/schema";
import { Scale } from "lucide-react";

export default function CGV() {
  return (
    <div className="text-[8.5px] leading-snug max-w-4xl mx-auto text-black dark:text-foreground print:text-[8px]" data-testid="cgv-section">
      <div className="text-center py-2 print:py-1 border-b mb-2 print:mb-1">
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <Scale className="w-3.5 h-3.5" />
          <h2 className="text-xs font-bold uppercase tracking-wide print:text-[10px]">Conditions Generales de Vente</h2>
        </div>
        <p className="text-[8px] text-neutral-500 dark:text-muted-foreground">
          {SATIS_CONSEILS.name} - {SATIS_CONSEILS.forme} - SIRET {SATIS_CONSEILS.siret}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 print:gap-x-4 print:gap-y-1">
        <section>
          <h3 className="font-bold text-[8.5px] uppercase mb-0.5 print:text-[8px]">Article 1 - Objet et champ d'application</h3>
          <p>
            Les presentes Conditions Generales de Vente (CGV) s'appliquent a toutes les prestations de conseil
            en prevention des risques professionnels et d'etablissement du Document Unique d'Evaluation des
            Risques Professionnels (DUERP) realisees par {SATIS_CONSEILS.name}, {SATIS_CONSEILS.forme},
            dont le siege social est situe {SATIS_CONSEILS.address}, {SATIS_CONSEILS.postalCode} {SATIS_CONSEILS.city},
            immatriculee au {SATIS_CONSEILS.rcs} sous le SIRET {SATIS_CONSEILS.siret}.
            Toute commande implique l'acceptation sans reserve des presentes CGV.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-[8.5px] uppercase mb-0.5 print:text-[8px]">Article 2 - Prestations</h3>
          <p>
            Les prestations proposees comprennent :
            l'etablissement du DUERP conformement aux articles R.4121-1 et suivants du Code du travail,
            la mise a jour annuelle du DUERP,
            l'evaluation des risques selon la methodologie INRS ED 840 et les questionnaires OiRA,
            l'elaboration du plan d'action de prevention associe,
            et le conseil en prevention des risques professionnels.
            Le contenu detaille est precise dans le bon de commande signe par le client.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-[8.5px] uppercase mb-0.5 print:text-[8px]">Article 3 - Tarifs et devis</h3>
          <p>
            Les prix sont exprimes en euros hors taxes (HT). La TVA au taux en vigueur (20%) sera ajoutee.
            Tarifs : Etablissement du DUERP : 900,00 EUR HT ; Mise a jour annuelle : 200,00 EUR HT.
            {SATIS_CONSEILS.name} se reserve le droit de modifier ses tarifs. Les prestations sont facturees
            sur la base des tarifs en vigueur au jour de la commande.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-[8.5px] uppercase mb-0.5 print:text-[8px]">Article 4 - Commande et acceptation</h3>
          <p>
            Toute commande est formalisee par la signature du bon de commande accompagne de la mention
            "Bon pour Accord", de la signature et du cachet du client. La commande ne devient
            definitive qu'apres acceptation expresse par {SATIS_CONSEILS.name}.
            Aucune commande ne pourra etre annulee apres acceptation, sauf accord ecrit.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-[8.5px] uppercase mb-0.5 print:text-[8px]">Article 5 - Execution des prestations</h3>
          <p>
            {SATIS_CONSEILS.name} s'engage a executer les prestations avec diligence et selon les regles de l'art,
            conformement aux normes en vigueur (INRS, OiRA). Les delais d'execution sont indicatifs sauf
            stipulation contraire. Le client s'engage a fournir toutes les informations et documents necessaires
            et a faciliter l'acces aux locaux le cas echeant.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-[8.5px] uppercase mb-0.5 print:text-[8px]">Article 6 - Facturation et paiement</h3>
          <p>
            La facture est emise a la validation du bon de commande. Le delai de paiement est de trente (30) jours
            a compter de la date d'emission de la facture, conformement a l'article L.441-10 du Code de commerce.
            Paiements acceptes par virement bancaire ou cheque a l'ordre de {SATIS_CONSEILS.name}.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-[8.5px] uppercase mb-0.5 print:text-[8px]">Article 7 - Penalites de retard</h3>
          <p>
            En cas de retard de paiement, des penalites seront exigibles de plein droit au taux de trois (3) fois
            le taux d'interet legal (art. L.441-10 du Code de commerce). Une indemnite forfaitaire de quarante (40) euros
            pour frais de recouvrement sera due de plein droit (art. D.441-5 du Code de commerce).
          </p>
        </section>

        <section>
          <h3 className="font-bold text-[8.5px] uppercase mb-0.5 print:text-[8px]">Article 8 - Propriete intellectuelle</h3>
          <p>
            Les documents, rapports et DUERP produits restent la propriete intellectuelle de {SATIS_CONSEILS.name}
            jusqu'au paiement integral. Apres paiement complet, le client devient proprietaire du DUERP
            et des documents associes pour un usage interne exclusif.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-[8.5px] uppercase mb-0.5 print:text-[8px]">Article 9 - Confidentialite</h3>
          <p>
            {SATIS_CONSEILS.name} s'engage a traiter comme confidentielles toutes les informations communiquees
            par le client. Cette obligation perdure pendant toute la duree du contrat et cinq (5) ans apres son terme.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-[8.5px] uppercase mb-0.5 print:text-[8px]">Article 10 - Responsabilite</h3>
          <p>
            {SATIS_CONSEILS.name} est soumise a une obligation de moyens. Sa responsabilite ne saurait etre engagee
            en cas de non-respect par le client de ses obligations legales ni en cas d'informations erronees
            fournies par le client. La responsabilite est limitee au montant de la prestation facturee.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-[8.5px] uppercase mb-0.5 print:text-[8px]">Article 11 - Force majeure</h3>
          <p>
            Aucune partie ne sera tenue responsable de l'inexecution de ses obligations en cas de force majeure
            (art. 1218 du Code civil). La partie invoquant la force majeure en informera l'autre dans les meilleurs delais.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-[8.5px] uppercase mb-0.5 print:text-[8px]">Article 12 - Protection des donnees personnelles</h3>
          <p>
            Conformement au RGPD et a la loi Informatique et Libertes, {SATIS_CONSEILS.name} protege les donnees
            personnelles collectees. Les donnees sont traitees aux seules fins de l'execution du contrat et
            de la gestion commerciale. Le client dispose d'un droit d'acces, de rectification, de suppression
            et de portabilite de ses donnees.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-[8.5px] uppercase mb-0.5 print:text-[8px]">Article 13 - Resiliation</h3>
          <p>
            En cas de manquement grave, l'autre partie pourra resilier le contrat de plein droit par lettre
            recommandee avec accuse de reception, apres mise en demeure restee sans effet pendant quinze (15) jours.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-[8.5px] uppercase mb-0.5 print:text-[8px]">Article 14 - Droit applicable et litiges</h3>
          <p>
            Les presentes CGV sont regies par le droit francais. En cas de litige, les parties rechercheront
            une solution amiable. A defaut sous trente (30) jours, le litige sera soumis a la competence
            exclusive du Tribunal de Commerce de Paris.
          </p>
        </section>
      </div>

      <Separator className="my-1.5 print:my-1" />

      <div className="text-center text-[7.5px] text-neutral-500 dark:text-muted-foreground space-y-0 pb-1">
        <p className="font-semibold">{SATIS_CONSEILS.name} - {SATIS_CONSEILS.forme}</p>
        <p>{SATIS_CONSEILS.address}, {SATIS_CONSEILS.postalCode} {SATIS_CONSEILS.city}</p>
        <p>SIRET : {SATIS_CONSEILS.siret} - TVA Intra. : {SATIS_CONSEILS.tvaIntra} - {SATIS_CONSEILS.rcs} - NAF : {SATIS_CONSEILS.naf}</p>
      </div>
    </div>
  );
}
