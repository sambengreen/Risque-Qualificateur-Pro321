import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  AlertTriangle, Scale, Gavel, Euro, ShieldAlert, UserX, FileWarning,
  ArrowRight, ChevronDown, ChevronUp, CheckCircle2, Building2,
  Clock, Ban, Siren, BookOpen, ExternalLink, Info, HandCoins,
  ShieldX, Landmark, Users, FileText, AlertOctagon,
} from "lucide-react";
import { useState } from "react";

const PENAL_SANCTIONS = [
  {
    title: "Absence de DUERP",
    articles: "Art. R. 4741-1 du Code du travail",
    description: "L'employeur qui ne transcrit pas ou ne met pas a jour les resultats de l'evaluation des risques dans un Document Unique s'expose a une contravention de 5e classe.",
    amende: "1 500 € par unite de travail",
    recidive: "3 000 € en cas de recidive",
    icon: FileWarning,
    severity: "high",
  },
  {
    title: "Mise en danger de la vie d'autrui",
    articles: "Art. 223-1 du Code penal",
    description: "Le fait d'exposer directement autrui a un risque immediat de mort ou de blessures de nature a entrainer une mutilation ou une infirmite permanente, par la violation manifestement deliberee d'une obligation de securite ou de prudence.",
    amende: "15 000 € d'amende",
    recidive: "1 an d'emprisonnement",
    icon: ShieldAlert,
    severity: "critical",
  },
  {
    title: "Homicide involontaire",
    articles: "Art. 221-6 du Code penal",
    description: "En cas d'accident mortel du travail, l'employeur peut etre poursuivi pour homicide involontaire s'il a commis une faute de negligence, d'imprudence ou un manquement a une obligation de securite.",
    amende: "45 000 € d'amende",
    recidive: "3 ans d'emprisonnement",
    icon: AlertOctagon,
    severity: "critical",
  },
  {
    title: "Blessures involontaires (ITT > 3 mois)",
    articles: "Art. 222-19 du Code penal",
    description: "Si l'accident du travail entraine une incapacite totale de travail superieure a 3 mois, l'employeur encourt des peines aggravees en cas de manquement a ses obligations de securite.",
    amende: "45 000 € d'amende",
    recidive: "3 ans d'emprisonnement",
    icon: UserX,
    severity: "critical",
  },
  {
    title: "Blessures involontaires (ITT <= 3 mois)",
    articles: "Art. 222-20 du Code penal",
    description: "En cas de blessures avec une ITT inferieure ou egale a 3 mois resultant d'un manquement delibere a une obligation de securite, l'employeur est passible de sanctions penales.",
    amende: "15 000 € d'amende",
    recidive: "1 an d'emprisonnement",
    icon: UserX,
    severity: "high",
  },
  {
    title: "Obstacle a l'inspection du travail",
    articles: "Art. L. 8114-1 du Code du travail",
    description: "Le fait de ne pas presenter le DUERP a l'inspection du travail lors d'un controle constitue un delit d'obstacle. L'employeur doit tenir le document a disposition.",
    amende: "37 500 € d'amende",
    recidive: "1 an d'emprisonnement",
    icon: Ban,
    severity: "critical",
  },
];

const FINANCIAL_CONSEQUENCES = [
  {
    title: "Faute inexcusable de l'employeur",
    description: "En cas d'accident du travail ou de maladie professionnelle, l'absence de DUERP constitue un indice fort de faute inexcusable. L'employeur avait ou aurait du avoir conscience du danger et n'a pas pris les mesures necessaires.",
    consequences: [
      "Majoration de la rente versee a la victime (jusqu'a doublement)",
      "Reparation integrale des prejudices (souffrances physiques et morales, prejudice esthetique, prejudice d'agrement)",
      "Remboursement a la CPAM des sommes avancees sous forme de capital",
      "L'action recursoire de la CPAM : l'organisme se retourne contre l'employeur",
    ],
    montant: "Plusieurs centaines de milliers d'euros",
    icon: HandCoins,
  },
  {
    title: "Cotisation AT/MP majoree",
    description: "Le taux de cotisation accidents du travail / maladies professionnelles est calcule en fonction de la sinistralite de l'entreprise. Plus il y a d'accidents, plus le taux augmente.",
    consequences: [
      "Augmentation du taux de cotisation AT/MP pour 3 ans",
      "Imposition de cotisations supplementaires par la CARSAT",
      "Ristourne impossible si pas de DUERP (reduction du taux AT/MP)",
      "Cout indirect : remplacement du salarie, desorganisation, perte de productivite",
    ],
    montant: "Impact significatif sur la masse salariale",
    icon: Euro,
  },
  {
    title: "Indemnisation civile complementaire",
    description: "Au-dela de la reparation forfaitaire du regime AT/MP, la victime peut obtenir une reparation complementaire integrale de ses prejudices en cas de faute inexcusable.",
    consequences: [
      "Indemnisation des souffrances physiques et morales",
      "Prejudice esthetique et d'agrement",
      "Perte de chance professionnelle",
      "Frais d'amenagement du logement et du vehicule en cas de handicap",
    ],
    montant: "Variable selon la gravite (50 000 € a plus de 500 000 €)",
    icon: Landmark,
  },
];

const OBLIGATIONS = [
  {
    title: "Obligation generale de securite",
    article: "Art. L. 4121-1 du Code du travail",
    content: "L'employeur prend les mesures necessaires pour assurer la securite et proteger la sante physique et mentale des travailleurs. Ces mesures comprennent des actions de prevention, d'information, de formation et la mise en place d'une organisation et de moyens adaptes.",
  },
  {
    title: "Obligation d'evaluer les risques",
    article: "Art. L. 4121-3 du Code du travail",
    content: "L'employeur, compte tenu de la nature des activites de l'etablissement, evalue les risques pour la sante et la securite des travailleurs, y compris dans le choix des procedes de fabrication, des equipements, des substances, de l'amenagement des lieux de travail.",
  },
  {
    title: "Obligation de transcrire dans le DUERP",
    article: "Art. R. 4121-1 du Code du travail",
    content: "L'employeur transcrit et met a jour dans un document unique les resultats de l'evaluation des risques. Cette evaluation comporte un inventaire des risques identifies dans chaque unite de travail.",
  },
  {
    title: "Obligation de mise a jour",
    article: "Art. R. 4121-2 du Code du travail",
    content: "La mise a jour est realisee au moins chaque annee (entreprises >= 11 salaries), lors de toute decision d'amenagement important modifiant les conditions de sante/securite, et lorsqu'une information supplementaire sur un risque est connue.",
  },
  {
    title: "Obligation de conservation (40 ans)",
    article: "Art. R. 4121-4 du Code du travail",
    content: "Le document unique et ses mises a jour font l'objet d'un depot dematerialise sur un portail numerique. L'employeur conserve les versions successives du DUERP pendant 40 ans.",
  },
  {
    title: "Obligation de consultation du CSE",
    article: "Art. L. 4121-3 et L. 2312-9 du Code du travail",
    content: "Le CSE est consulte sur le document unique et ses mises a jour. Le DUERP est tenu a la disposition des salaries, anciens salaries, medecin du travail, inspection du travail et agents de la CARSAT.",
  },
];

const JURISPRUDENCE = [
  {
    arret: "Cass. soc., 28 fevrier 2002, n° 00-10.051 (Arret amiante)",
    resume: "Arret fondateur : l'employeur est tenu envers le salarie d'une obligation de securite de resultat. Le manquement a cette obligation a le caractere d'une faute inexcusable lorsque l'employeur avait ou aurait du avoir conscience du danger et n'a pas pris les mesures necessaires pour en preserver le salarie.",
  },
  {
    arret: "Cass. soc., 5 mars 2008, n° 06-45.888",
    resume: "L'absence de document unique d'evaluation des risques constitue pour le juge un element determinant pour caracteriser la faute inexcusable de l'employeur en cas d'accident du travail.",
  },
  {
    arret: "Cass. soc., 8 juillet 2014, n° 13-15.470",
    resume: "Le simple manquement a l'obligation de securite de resultat suffit a engager la responsabilite de l'employeur, sans que celui-ci puisse s'exonerer en invoquant l'absence de faute de sa part.",
  },
  {
    arret: "Cass. crim., 12 septembre 2017",
    resume: "Condamnation d'un employeur pour blessures involontaires apres un accident du travail grave. L'absence de DUERP et de formation a la securite a constitue un facteur aggravant dans la determination de la peine.",
  },
];

const TIMELINE_EVENTS = [
  { year: "2001", event: "Decret n° 2001-1016 du 5 novembre 2001 : creation de l'obligation du Document Unique" },
  { year: "2002", event: "Arrets amiante de la Cour de cassation : obligation de securite de resultat" },
  { year: "2010", event: "Loi du 9 novembre 2010 : reforme des retraites et penibilite au travail" },
  { year: "2017", event: "Ordonnances Macron : fusion des instances representatives en CSE" },
  { year: "2022", event: "Loi du 2 aout 2021 (ANI) : renforcement de la prevention, depot dematerialise du DUERP, conservation 40 ans" },
];

export default function EmployerRisks() {
  const [expandedPenal, setExpandedPenal] = useState<number | null>(null);
  const [expandedFinancial, setExpandedFinancial] = useState<number | null>(null);
  const [expandedObligation, setExpandedObligation] = useState<number | null>(null);
  const [expandedJuris, setExpandedJuris] = useState<number | null>(null);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Link href="/" className="hover:text-foreground transition-colors" data-testid="link-breadcrumb-home">Accueil</Link>
          <ArrowRight className="w-3 h-3" />
          <span>Risques employeur</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight" data-testid="text-employer-risks-title">
          Risques et sanctions pour l'employeur
        </h1>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-3xl">
          L'absence de Document Unique d'Evaluation des Risques Professionnels (DUERP) expose l'employeur
          a de lourdes sanctions penales, financieres et civiles. Voici un panorama complet des risques encourus.
        </p>
      </div>

      <Card className="overflow-hidden border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
        <div className="bg-red-600 px-5 py-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Siren className="w-5 h-5" />
            Alerte : ce que risque l'employeur sans DUERP
          </h2>
        </div>
        <CardContent className="p-4 md:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-white dark:bg-background border">
              <Gavel className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">3 ans</p>
              <p className="text-xs text-muted-foreground mt-1">d'emprisonnement possible</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white dark:bg-background border">
              <Euro className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">45 000 €</p>
              <p className="text-xs text-muted-foreground mt-1">d'amende penale maximale</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white dark:bg-background border">
              <HandCoins className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">500 000 €+</p>
              <p className="text-xs text-muted-foreground mt-1">en faute inexcusable</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white dark:bg-background border">
              <ShieldX className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">Responsabilite</p>
              <p className="text-xs text-muted-foreground mt-1">penale du dirigeant</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-primary/20">
        <div className="bg-primary px-5 py-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Obligations legales de l'employeur
          </h2>
        </div>
        <CardContent className="p-0">
          <div className="divide-y">
            {OBLIGATIONS.map((item, idx) => {
              const isOpen = expandedObligation === idx;
              return (
                <div
                  key={idx}
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => setExpandedObligation(isOpen ? null : idx)}
                  data-testid={`obligation-${idx}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Scale className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground">{item.article}</p>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  {isOpen && (
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed pl-11" onClick={(e) => e.stopPropagation()}>
                      {item.content}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Gavel className="w-5 h-5 text-red-600" />
          Sanctions penales
        </h2>
        <div className="space-y-3">
          {PENAL_SANCTIONS.map((sanction, idx) => {
            const isExpanded = expandedPenal === idx;
            const Icon = sanction.icon;
            const severityColor = sanction.severity === "critical"
              ? "border-red-300 dark:border-red-800"
              : "border-orange-300 dark:border-orange-800";
            const severityBg = sanction.severity === "critical"
              ? "bg-red-50 dark:bg-red-950/20"
              : "bg-orange-50 dark:bg-orange-950/20";
            return (
              <Card
                key={idx}
                className={`overflow-hidden cursor-pointer transition-all ${severityColor} ${isExpanded ? severityBg : ""}`}
                onClick={() => setExpandedPenal(isExpanded ? null : idx)}
                data-testid={`penal-sanction-${idx}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full ${sanction.severity === "critical" ? "bg-red-600" : "bg-orange-600"} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sm">{sanction.title}</h3>
                          <p className="text-[11px] text-muted-foreground">{sanction.articles}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={sanction.severity === "critical" ? "destructive" : "secondary"} className="text-[10px]">
                            {sanction.severity === "critical" ? "Delit" : "Contravention"}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {sanction.description}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className={`rounded-md p-3 border ${severityColor} ${severityBg}`}>
                              <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">Amende</p>
                              <p className="text-sm font-bold text-red-600">{sanction.amende}</p>
                            </div>
                            <div className={`rounded-md p-3 border ${severityColor} ${severityBg}`}>
                              <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">Recidive / Emprisonnement</p>
                              <p className="text-sm font-bold text-red-600">{sanction.recidive}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Euro className="w-5 h-5 text-amber-600" />
          Consequences financieres et civiles
        </h2>
        <div className="space-y-3">
          {FINANCIAL_CONSEQUENCES.map((item, idx) => {
            const isExpanded = expandedFinancial === idx;
            const Icon = item.icon;
            return (
              <Card
                key={idx}
                className={`overflow-hidden cursor-pointer transition-all border-amber-200 dark:border-amber-800 ${isExpanded ? "bg-amber-50/50 dark:bg-amber-950/20" : ""}`}
                onClick={() => setExpandedFinancial(isExpanded ? null : idx)}
                data-testid={`financial-${idx}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-sm">{item.title}</h3>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                      {isExpanded && (
                        <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                          <ul className="space-y-1.5">
                            {item.consequences.map((c, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="rounded-md p-3 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
                            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">Montant potentiel</p>
                            <p className="text-sm font-bold text-amber-700 dark:text-amber-500">{item.montant}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="overflow-hidden border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-3 bg-purple-50 dark:bg-purple-950/20">
          <CardTitle className="text-base flex items-center gap-2">
            <Landmark className="w-5 h-5 text-purple-600" />
            Jurisprudence cle
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Decisions de justice marquantes en matiere de responsabilite de l'employeur
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {JURISPRUDENCE.map((item, idx) => {
              const isOpen = expandedJuris === idx;
              return (
                <div
                  key={idx}
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => setExpandedJuris(isOpen ? null : idx)}
                  data-testid={`jurisprudence-${idx}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Gavel className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                      {item.arret}
                    </p>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  {isOpen && (
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed pl-6" onClick={(e) => e.stopPropagation()}>
                      {item.resume}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Evolution reglementaire
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-2.5 top-1 bottom-1 w-px bg-border" />
            {TIMELINE_EVENTS.map((item, idx) => (
              <div key={idx} className="relative" data-testid={`timeline-${idx}`}>
                <div className="absolute -left-[14px] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                <div>
                  <Badge variant="outline" className="text-[10px] font-bold mb-1">{item.year}</Badge>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10">
        <div className="bg-green-600 px-5 py-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Comment se mettre en conformite ?
          </h2>
        </div>
        <CardContent className="p-4 md:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-600" />
                Actions immediates
              </h3>
              <ul className="space-y-2">
                {[
                  "Realiser le Document Unique d'Evaluation des Risques",
                  "Identifier toutes les unites de travail de l'entreprise",
                  "Evaluer les risques pour chaque unite de travail",
                  "Definir un plan d'actions de prevention",
                  "Mettre le DUERP a disposition des salaries et du CSE",
                ].map((item, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                Actions continues
              </h3>
              <ul className="space-y-2">
                {[
                  "Mettre a jour le DUERP chaque annee (entreprises >= 11 salaries)",
                  "Actualiser lors de tout changement important",
                  "Former les salaries a la securite",
                  "Consulter le CSE sur les mesures de prevention",
                  "Archiver toutes les versions pendant 40 ans",
                ].map((item, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex gap-3 mt-5 flex-wrap">
            <Link href="/companies/new">
              <Button size="sm" className="text-xs" data-testid="button-start-evaluation">
                <Building2 className="w-3.5 h-3.5 mr-1" /> Demarrer une evaluation
              </Button>
            </Link>
            <Link href="/methodology">
              <Button variant="outline" size="sm" className="text-xs" data-testid="button-goto-methodology">
                <BookOpen className="w-3.5 h-3.5 mr-1" /> Methodologie DUERP
              </Button>
            </Link>
            <Link href="/prevention">
              <Button variant="outline" size="sm" className="text-xs" data-testid="button-goto-prevention">
                <Info className="w-3.5 h-3.5 mr-1" /> Base de connaissances
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="text-center pb-4">
        <p className="text-[10px] text-muted-foreground/50">
          Sources : Code du travail, Code penal, Jurisprudence Cour de cassation — INRS — ameli.fr/entreprise
        </p>
      </div>
    </div>
  );
}
