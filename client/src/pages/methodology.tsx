import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  BookOpen, Users, Search, BarChart3, ListChecks, FileText,
  Shield, AlertTriangle, Factory, CheckCircle2, CalendarDays,
  ArrowRight, Lightbulb, Scale, Building2, Clock, Info,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { useState } from "react";

const STEPS = [
  {
    number: 1,
    title: "Preparer l'evaluation",
    icon: Users,
    color: "bg-blue-600",
    textColor: "text-blue-600",
    borderColor: "border-blue-200 dark:border-blue-800",
    bgLight: "bg-blue-50 dark:bg-blue-950/30",
    content: [
      "Definir le cadre de l'evaluation et les moyens alloues.",
      "Constituer un groupe de travail impliquant les acteurs internes (membres du CSE, salaries, encadrement).",
      "Definir les unites de travail : ensembles homogenes de situations d'exposition a des dangers.",
      "Choisir les outils d'evaluation (grilles, check-lists, questionnaires OiRA).",
      "Former les acteurs internes si necessaire.",
      "Communiquer aupres des salaries sur la demarche.",
    ],
    tips: "La notion d'unite de travail n'est pas necessairement un poste de travail. Elle peut concerner plusieurs salaries avec des fonctions differentes mais exposes a un meme danger.",
  },
  {
    number: 2,
    title: "Identifier et recenser les risques",
    icon: Search,
    color: "bg-amber-600",
    textColor: "text-amber-600",
    borderColor: "border-amber-200 dark:border-amber-800",
    bgLight: "bg-amber-50 dark:bg-amber-950/30",
    content: [
      "Reperer tout ce qui est susceptible de porter atteinte a la sante des salaries.",
      "Utiliser les fiches risques de la brochure INRS ED 840 (20 familles de risques).",
      "Analyser les postes de travail par observation du travail reel.",
      "Dialoguer avec les personnes qui occupent les postes.",
      "Effectuer des mesures sur le terrain (bruit, ambiance thermique, eclairage...).",
      "Analyser les accidents du travail, incidents et presqu'accidents anterieurs.",
    ],
    tips: "Les questionnaires OiRA integres dans cette application vous guident dans l'identification des risques specifiques a chaque secteur d'activite.",
  },
  {
    number: 3,
    title: "Analyser les risques",
    icon: BarChart3,
    color: "bg-orange-600",
    textColor: "text-orange-600",
    borderColor: "border-orange-200 dark:border-orange-800",
    bgLight: "bg-orange-50 dark:bg-orange-950/30",
    content: [
      "Mettre en lien les risques identifies avec les conditions d'exposition des salaries.",
      "Evaluer le type d'exposition : rayonnements, vibrations, produits chimiques, bruit...",
      "Mesurer la frequence d'exposition (heures/jour, nombre d'expositions/mois).",
      "Determiner le niveau d'exposition (dose recue, intensite).",
      "Caracteriser la population exposee : nombre de salaries, age, anciennete, genre.",
    ],
    tips: "L'analyse doit porter sur le travail reel et non sur le travail prescrit. Observez les conditions effectives d'exposition.",
  },
  {
    number: 4,
    title: "Apprecier les risques",
    icon: ListChecks,
    color: "bg-red-600",
    textColor: "text-red-600",
    borderColor: "border-red-200 dark:border-red-800",
    bgLight: "bg-red-50 dark:bg-red-950/30",
    content: [
      "Etape essentielle : passer de l'inventaire a la definition d'un plan d'actions coherent.",
      "S'appuyer sur l'experience et les connaissances des salaries.",
      "Utiliser des criteres : nombre de personnes exposees, duree d'exposition, gravite potentielle.",
      "Hierarchiser et prioriser les risques identifies.",
      "Planifier les actions de prevention a mettre en place.",
    ],
    tips: "Le mode d'appreciation reste a la main de l'employeur. Dans cette application, vous evaluez la gravite (1-4) et la probabilite (1-4) pour calculer la priorite.",
  },
  {
    number: 5,
    title: "Transcrire dans le Document Unique",
    icon: FileText,
    color: "bg-green-600",
    textColor: "text-green-600",
    borderColor: "border-green-200 dark:border-green-800",
    bgLight: "bg-green-50 dark:bg-green-950/30",
    content: [
      "Formaliser les resultats de l'evaluation dans le DUERP.",
      "Inclure : le cadre de l'evaluation, la methode d'analyse, l'inventaire des risques, les actions a mettre en place.",
      "Annexer les donnees collectives sur les facteurs de penibilite.",
      "Indiquer la proportion de salaries exposes au-dela des seuils.",
      "Definir le plan d'actions de prevention (Papripact pour les entreprises ≥ 50 salaries).",
    ],
    tips: "Le DUERP doit etre tenu a disposition des salaries, du medecin du travail, de l'inspection du travail et des agents de la CARSAT.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Qui est concerne par le DUERP ?",
    answer: "Tout employeur, quel que soit l'effectif de son entreprise, doit evaluer les risques professionnels et transcrire les resultats dans un Document Unique. Cette obligation concerne toutes les entreprises et tous les secteurs d'activite.",
  },
  {
    question: "A quelle frequence mettre a jour le DUERP ?",
    answer: "Le DUERP doit etre mis a jour au minimum chaque annee pour les entreprises d'au moins 11 salaries, lors de toute decision d'amenagement important modifiant les conditions de travail, et lorsqu'une information supplementaire interessant l'evaluation d'un risque est portee a la connaissance de l'employeur.",
  },
  {
    question: "Combien de temps conserver le DUERP ?",
    answer: "Le Document Unique et ses versions anterieures doivent etre conserves et archives pendant une duree de 40 ans a compter de leur elaboration, conformement au Code du travail.",
  },
  {
    question: "Que doit contenir le DUERP ?",
    answer: "Le DUERP doit contenir : le cadre de l'evaluation, la methode d'analyse des risques choisie, la methode d'appreciation, l'inventaire des risques identifies et evalues, et les actions a mettre en place. Il doit aussi annexer les donnees collectives sur la penibilite.",
  },
  {
    question: "Qu'est-ce que le Papripact ?",
    answer: "Le Programme Annuel de Prevention des Risques Professionnels et d'Amelioration des Conditions de Travail (Papripact) est obligatoire pour les entreprises de 50 salaries et plus. Il fixe la liste des mesures de prevention a prendre au cours de l'annee a venir.",
  },
];

export default function Methodology() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Link href="/" className="hover:text-foreground transition-colors" data-testid="link-breadcrumb-home">Accueil</Link>
          <ArrowRight className="w-3 h-3" />
          <span>Methodologie DUERP</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight" data-testid="text-methodology-title">
          Document Unique d'Evaluation des Risques Professionnels
        </h1>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-3xl">
          L'evaluation des risques professionnels (EvRP) est une obligation de l'employeur prevue par le Code du travail.
          Elle est structuree en 5 etapes cles et aboutit a la transcription des resultats dans le DUERP.
        </p>
      </div>

      <Card className="overflow-hidden border-primary/20">
        <div className="bg-primary px-5 py-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Base reglementaire
          </h2>
        </div>
        <CardContent className="p-4 md:p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <CalendarDays className="w-8 h-8 text-primary p-1.5 bg-primary/10 rounded-lg flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Mise a jour obligatoire</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Au minimum <strong>chaque annee</strong> pour les entreprises de 11 salaries et plus.
                  Aussi lors de tout amenagement important.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-8 h-8 text-primary p-1.5 bg-primary/10 rounded-lg flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Conservation 40 ans</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Le DUERP et ses versions anterieures doivent etre conserves <strong>40 ans</strong> a compter de leur elaboration.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-8 h-8 text-primary p-1.5 bg-primary/10 rounded-lg flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Consultation du CSE</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Le CSE doit etre consulte. Le DUERP est tenu a disposition des salaries, du medecin du travail et de l'inspection du travail.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              <strong>References :</strong> Articles L. 4121-1 a L. 4121-5 et R. 4121-1 a R. 4121-4 du Code du travail.
              Brochure INRS ED 840 — Evaluation des risques professionnels.
            </p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Les 5 etapes de l'evaluation des risques
        </h2>

        <div className="space-y-3">
          {STEPS.map((step) => {
            const isExpanded = expandedStep === step.number;
            return (
              <Card
                key={step.number}
                className={`overflow-hidden cursor-pointer transition-all ${step.borderColor} ${isExpanded ? step.bgLight : ""}`}
                onClick={() => setExpandedStep(isExpanded ? null : step.number)}
                data-testid={`card-step-${step.number}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-full ${step.color} flex items-center justify-center flex-shrink-0 text-white font-bold text-base`}>
                      {step.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-sm md:text-base">{step.title}</h3>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>

                      {isExpanded && (
                        <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
                          <ul className="space-y-1.5">
                            {step.content.map((item, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
                                <CheckCircle2 className={`w-3.5 h-3.5 ${step.textColor} mt-0.5 flex-shrink-0`} />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>

                          <div className={`${step.bgLight} rounded-md p-3 border ${step.borderColor}`}>
                            <p className="text-xs flex items-start gap-2">
                              <Lightbulb className={`w-4 h-4 ${step.textColor} flex-shrink-0 mt-0.5`} />
                              <span className="text-muted-foreground leading-relaxed">
                                <strong className="text-foreground">Conseil :</strong> {step.tips}
                              </span>
                            </p>
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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Questions frequentes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="px-4 py-3 cursor-pointer hover-elevate"
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  data-testid={`faq-${idx}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{item.question}</p>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  {isOpen && (
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed" onClick={(e) => e.stopPropagation()}>
                      {item.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Outils integres dans Satis Consulting</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Cette application integre les 46 questionnaires sectoriels OiRA de l'INRS et les 20 familles de risques de la brochure ED 840
                pour vous accompagner dans chaque etape de votre evaluation des risques professionnels.
              </p>
              <div className="flex gap-3 mt-3 flex-wrap">
                <Link href="/sectors">
                  <Button variant="outline" size="sm" className="text-xs" data-testid="button-goto-sectors">
                    <Factory className="w-3.5 h-3.5 mr-1" /> 46 secteurs OiRA
                  </Button>
                </Link>
                <Link href="/risks">
                  <Button variant="outline" size="sm" className="text-xs" data-testid="button-goto-risks">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" /> 20 risques ED 840
                  </Button>
                </Link>
                <Link href="/companies/new">
                  <Button size="sm" className="text-xs" data-testid="button-goto-new-company">
                    <Building2 className="w-3.5 h-3.5 mr-1" /> Demarrer une evaluation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center pb-4">
        <p className="text-[10px] text-muted-foreground/50">
          Source : INRS — inrs.fr/demarche/document-unique — Brochure ED 840
        </p>
      </div>
    </div>
  );
}
