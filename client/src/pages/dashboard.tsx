import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2, ClipboardCheck, Factory, AlertTriangle,
  Plus, ArrowRight, Shield, BookOpen,
  ListChecks, Search, BarChart3, FileText, CheckCircle2,
  Clock, Users, CalendarDays,
} from "lucide-react";
import type { Company, Assessment, IndustrySector, RiskCategory } from "@shared/schema";

const FIVE_STEPS = [
  {
    step: 1,
    title: "Preparer",
    subtitle: "l'evaluation",
    description: "Definir le cadre, les moyens et l'organisation de l'evaluation des risques professionnels.",
    icon: Users,
    color: "bg-blue-600",
    textColor: "text-blue-600",
    bgLight: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    step: 2,
    title: "Identifier",
    subtitle: "les risques",
    description: "Reperer les dangers et les situations dangereuses a l'aide des fiches ED 840 et questionnaires OiRA.",
    icon: Search,
    color: "bg-amber-600",
    textColor: "text-amber-600",
    bgLight: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    step: 3,
    title: "Analyser",
    subtitle: "les risques",
    description: "Mettre en lien les risques identifies avec les conditions d'exposition des salaries.",
    icon: BarChart3,
    color: "bg-orange-600",
    textColor: "text-orange-600",
    bgLight: "bg-orange-50 dark:bg-orange-950/30",
  },
  {
    step: 4,
    title: "Apprecier",
    subtitle: "les risques",
    description: "Hierarchiser et prioriser les risques pour definir un plan d'actions coherent.",
    icon: ListChecks,
    color: "bg-red-600",
    textColor: "text-red-600",
    bgLight: "bg-red-50 dark:bg-red-950/30",
  },
  {
    step: 5,
    title: "Transcrire",
    subtitle: "dans le DUERP",
    description: "Formaliser les resultats dans le Document Unique et definir le plan d'actions de prevention.",
    icon: FileText,
    color: "bg-green-600",
    textColor: "text-green-600",
    bgLight: "bg-green-50 dark:bg-green-950/30",
  },
];

export default function Dashboard() {
  const { data: companies, isLoading: loadingCompanies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: assessments, isLoading: loadingAssessments } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
  });

  const { data: sectors } = useQuery<IndustrySector[]>({
    queryKey: ["/api/sectors"],
  });

  const { data: riskCategories } = useQuery<RiskCategory[]>({
    queryKey: ["/api/risk-categories"],
  });

  const inProgress = assessments?.filter((a) => a.status === "in_progress") || [];

  const stats = [
    {
      title: "Entreprises",
      value: companies?.length || 0,
      icon: Building2,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/companies",
    },
    {
      title: "Evaluations",
      value: assessments?.length || 0,
      icon: ClipboardCheck,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      href: "/assessments",
      sub: inProgress.length > 0 ? `${inProgress.length} en cours` : undefined,
    },
    {
      title: "Secteurs OiRA",
      value: sectors?.length || 0,
      icon: Factory,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      href: "/sectors",
    },
    {
      title: "Risques ED 840",
      value: riskCategories?.length || 0,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      href: "/risks",
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight" data-testid="text-dashboard-title">
            Tableau de bord
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Satis Consulting — Document Unique d'Evaluation des Risques Professionnels
          </p>
        </div>
        <Link href="/companies/new">
          <Button data-testid="button-new-company">
            <Plus className="w-4 h-4 mr-1.5" />
            Nouvelle entreprise
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="cursor-pointer hover-elevate h-full" data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s/g, '-')}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    {loadingCompanies || loadingAssessments ? (
                      <Skeleton className="h-6 w-8" />
                    ) : (
                      <p className="text-xl font-bold" data-testid={`text-stat-value-${stat.title.toLowerCase().replace(/\s/g, '-')}`}>
                        {stat.value}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                    {"sub" in stat && stat.sub && (
                      <p className="text-[10px] text-chart-3 font-medium">{stat.sub}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="overflow-hidden border-primary/20">
        <div className="bg-primary px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Demarche d'evaluation des risques professionnels
              </h2>
              <p className="text-xs text-white/70 mt-0.5">
                Methodologie INRS en 5 etapes — Conforme au Code du travail (art. R. 4121-1 et suivants)
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-4 md:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {FIVE_STEPS.map((step, idx) => (
              <div key={step.step} className="relative" data-testid={`step-${step.step}`}>
                <div className={`${step.bgLight} rounded-lg p-3 h-full border border-transparent hover:border-primary/20 transition-colors`}>
                  <div className="flex sm:flex-col items-start gap-3">
                    <div className={`w-9 h-9 rounded-full ${step.color} flex items-center justify-center flex-shrink-0 text-white font-bold text-sm`}>
                      {step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm leading-tight">
                        {step.title}
                      </p>
                      <p className={`text-xs ${step.textColor} font-medium`}>
                        {step.subtitle}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed hidden sm:block">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
                {idx < 4 && (
                  <div className="hidden sm:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              L'evaluation des risques professionnels (EvRP) est une obligation de l'employeur (art. L. 4121-3 du Code du travail).
              Elle aboutit a la redaction du DUERP, document a conserver <strong>40 ans</strong> et a mettre a jour au minimum <strong>chaque annee</strong> (entreprises ≥ 11 salaries).
            </p>
            <Link href="/methodology">
              <Button variant="outline" size="sm" className="text-xs flex-shrink-0" data-testid="button-methodology">
                <BookOpen className="w-3.5 h-3.5 mr-1" /> En savoir plus
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-chart-3" />
              Evaluations en cours
            </CardTitle>
            <Link href="/assessments">
              <Button variant="ghost" size="sm" className="h-7 text-xs" data-testid="button-see-all-assessments">
                Voir tout <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {inProgress.length > 0 ? (
              <div className="divide-y">
                {inProgress.slice(0, 5).map((a) => {
                  const company = companies?.find((c) => c.id === a.companyId);
                  return (
                    <Link key={a.id} href={`/assessments/${a.id}`}>
                      <div className="flex items-center gap-3 p-3 cursor-pointer hover-elevate" data-testid={`card-in-progress-${a.id}`}>
                        <div className="w-8 h-8 rounded-md bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                          <ClipboardCheck className="w-4 h-4 text-chart-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{company?.name || "..."}</p>
                          <p className="text-xs text-muted-foreground">
                            {a.assessorName} — {new Date(a.date).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-[10px] flex-shrink-0">En cours</Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center">
                <ClipboardCheck className="w-8 h-8 mx-auto text-muted-foreground/20 mb-2" />
                <p className="text-xs text-muted-foreground">Aucune evaluation en cours</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  Creez une entreprise puis lancez une evaluation
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Dernieres entreprises
            </CardTitle>
            <Link href="/companies">
              <Button variant="ghost" size="sm" className="h-7 text-xs" data-testid="button-see-all-companies">
                Voir tout <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {companies && companies.length > 0 ? (
              <div className="divide-y">
                {companies.slice(0, 5).map((c) => (
                  <Link key={c.id} href={`/companies/${c.id}`}>
                    <div className="flex items-center gap-3 p-3 cursor-pointer hover-elevate" data-testid={`card-company-${c.id}`}>
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.city || ""}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <Building2 className="w-8 h-8 mx-auto text-muted-foreground/20 mb-2" />
                <p className="text-xs text-muted-foreground">Aucune entreprise</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link href="/sectors">
          <Card className="hover-elevate cursor-pointer h-full" data-testid="card-link-sectors">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center flex-shrink-0">
                <Factory className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Questionnaires sectoriels</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  46 outils OiRA adaptes par secteur d'activite, conformes aux fiches INRS.
                </p>
                <Badge variant="secondary" className="mt-2 text-[10px]">
                  {sectors?.length || 46} secteurs
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/risks">
          <Card className="hover-elevate cursor-pointer h-full" data-testid="card-link-risks">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Familles de risques ED 840</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  20 categories de risques professionnels pour identifier et evaluer les dangers.
                </p>
                <Badge variant="secondary" className="mt-2 text-[10px]">
                  {riskCategories?.length || 20} categories
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/methodology">
          <Card className="hover-elevate cursor-pointer h-full" data-testid="card-link-methodology">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Methodologie DUERP</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Guide complet de la demarche d'evaluation des risques selon l'INRS.
                </p>
                <Badge variant="secondary" className="mt-2 text-[10px]">
                  Reglementation
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Rappel reglementaire</h3>
              <div className="text-xs text-muted-foreground mt-1.5 space-y-1.5 leading-relaxed">
                <p>
                  L'employeur doit transcrire les resultats de l'evaluation des risques professionnels
                  dans le <strong>Document Unique d'Evaluation des Risques Professionnels (DUERP)</strong>,
                  conformement aux articles R. 4121-1 et suivants du Code du travail.
                </p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <CalendarDays className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>Mise a jour <strong>annuelle</strong> obligatoire (≥ 11 salaries)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>Conservation <strong>40 ans</strong> minimum</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>Consultation du <strong>CSE</strong> obligatoire</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
