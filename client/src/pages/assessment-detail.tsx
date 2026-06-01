import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useMemo } from "react";
import {
  ArrowLeft, Trash2, Play, CheckCircle2, Building2,
  Calendar, User, AlertTriangle, ShieldCheck, FileText,
  MapPin, Phone, Mail, Users, Factory, BarChart3,
  Target, ClipboardList, TrendingDown, Shield,
  Download, BookOpen, ListChecks, Printer, Info,
} from "lucide-react";
import type { Assessment, Company, QuestionResponse, SectorQuestion, IndustrySector } from "@shared/schema";

function RiskMatrix({ responses }: { responses: QuestionResponse[] }) {
  const risks = responses.filter((r) => r.response === true);
  const matrix = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => 0));
  risks.forEach((r) => {
    const g = Math.max(1, Math.min(4, r.gravityLevel || 1)) - 1;
    const p = Math.max(1, Math.min(4, r.probabilityLevel || 1)) - 1;
    matrix[g][p]++;
  });

  const getCellColor = (g: number, p: number) => {
    const score = (g + 1) * (p + 1);
    if (score >= 12) return "bg-red-600 text-white";
    if (score >= 8) return "bg-orange-500 text-white";
    if (score >= 4) return "bg-yellow-400 text-black";
    return "bg-green-500 text-white";
  };

  const gravityLabels = ["Faible (1)", "Moyenne (2)", "Grave (3)", "Tres grave (4)"];
  const probabilityLabels = ["Improbable (1)", "Possible (2)", "Probable (3)", "Tres probable (4)"];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs" data-testid="table-risk-matrix">
        <thead>
          <tr>
            <th className="border p-2 bg-[#1e4a8a] text-white text-left text-[11px]">Gravite / Probabilite</th>
            {probabilityLabels.map((label, i) => (
              <th key={i} className="border p-2 bg-[#1e4a8a] text-white text-center font-medium text-[11px]">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {gravityLabels.map((label, g) => (
            <tr key={g}>
              <td className="border p-2 bg-muted/50 font-medium text-[11px]">{label}</td>
              {[0, 1, 2, 3].map((p) => (
                <td key={p} className={`border p-2 text-center font-bold ${getCellColor(3 - g, p)}`}>
                  {matrix[3 - g][p] > 0 ? matrix[3 - g][p] : ""}
                </td>
              ))}
            </tr>
          )).reverse()}
        </tbody>
      </table>
      <div className="flex gap-4 mt-3 text-[11px] flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-sm bg-green-500" /> Risque faible (1-3)</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-sm bg-yellow-400" /> Risque modere (4-6)</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-sm bg-orange-500" /> Risque eleve (8-9)</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-sm bg-red-600" /> Risque critique (12-16)</span>
      </div>
    </div>
  );
}

export default function AssessmentDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("rapport");

  const { data: assessment, isLoading } = useQuery<Assessment>({
    queryKey: ["/api/assessments", id],
  });

  const { data: companies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: responses } = useQuery<QuestionResponse[]>({
    queryKey: ["/api/assessments", id, "responses"],
  });

  const { data: sectors } = useQuery<IndustrySector[]>({
    queryKey: ["/api/sectors"],
  });

  const company = companies?.find((c) => c.id === assessment?.companyId);
  const sectorId = company?.industrySectorId;

  const { data: questions } = useQuery<SectorQuestion[]>({
    queryKey: ["/api/sectors", sectorId, "questions"],
    enabled: !!sectorId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/assessments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      toast({ title: "Evaluation supprimee" });
      navigate("/assessments");
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => apiRequest("PATCH", `/api/assessments/${id}`, { status: "completed" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", id] });
      toast({ title: "Evaluation terminee et finalisee" });
    },
  });

  const stats = useMemo(() => {
    if (!responses || !questions) return null;
    const totalQuestions = questions.length;
    const answered = responses.filter((r) => r.response !== null);
    const risksYes = responses.filter((r) => r.response === true);
    const risksNo = responses.filter((r) => r.response === false);
    const withAction = risksYes.filter((r) => r.actionPlan && r.actionPlan.trim().length > 0);
    const withResponsible = risksYes.filter((r) => r.responsible && r.responsible.trim().length > 0);

    const priorityCounts = { urgente: 0, haute: 0, moyenne: 0, faible: 0 };
    risksYes.forEach((r) => {
      const p = (r.priority || "faible") as keyof typeof priorityCounts;
      if (priorityCounts[p] !== undefined) priorityCounts[p]++;
    });

    const avgGravity = risksYes.length > 0
      ? risksYes.reduce((sum, r) => sum + (r.gravityLevel || 1), 0) / risksYes.length : 0;
    const avgProbability = risksYes.length > 0
      ? risksYes.reduce((sum, r) => sum + (r.probabilityLevel || 1), 0) / risksYes.length : 0;
    const avgScore = risksYes.length > 0
      ? risksYes.reduce((sum, r) => sum + (r.gravityLevel || 1) * (r.probabilityLevel || 1), 0) / risksYes.length : 0;

    const completionRate = totalQuestions > 0 ? Math.round((answered.length / totalQuestions) * 100) : 0;

    return {
      totalQuestions,
      answered: answered.length,
      risksYes: risksYes.length,
      risksNo: risksNo.length,
      withAction: withAction.length,
      withResponsible: withResponsible.length,
      priorityCounts,
      avgGravity: avgGravity.toFixed(1),
      avgProbability: avgProbability.toFixed(1),
      avgScore: avgScore.toFixed(1),
      completionRate,
    };
  }, [responses, questions]);

  const moduleBreakdown = useMemo(() => {
    if (!questions || !responses) return [];
    const modules: Record<string, { total: number; answered: number; risks: number; questions: { q: SectorQuestion; r?: QuestionResponse }[] }> = {};
    questions.forEach((q) => {
      if (!modules[q.module]) modules[q.module] = { total: 0, answered: 0, risks: 0, questions: [] };
      modules[q.module].total++;
      const resp = responses.find((r) => r.questionId === q.id);
      modules[q.module].questions.push({ q, r: resp });
      if (resp && resp.response !== null) {
        modules[q.module].answered++;
        if (resp.response === true) modules[q.module].risks++;
      }
    });
    return Object.entries(modules).map(([name, data]) => ({ name, ...data }));
  }, [questions, responses]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!assessment) {
    return <div className="p-6 text-center text-muted-foreground">Evaluation non trouvee</div>;
  }

  const sector = sectors?.find((s) => s.id === company?.industrySectorId);
  const risksIdentified = responses?.filter((r) => r.response === true) || [];

  const getQuestion = (questionId: string) => questions?.find((q) => q.id === questionId);
  const getQuestionText = (questionId: string) => getQuestion(questionId)?.question || "Question";
  const getQuestionModule = (questionId: string) => getQuestion(questionId)?.module || "";
  const getQuestionPrevention = (questionId: string) => getQuestion(questionId)?.preventionMeasure || "";
  const getQuestionDescription = (questionId: string) => getQuestion(questionId)?.description || "";

  const getPriorityBadge = (priority: string | null) => {
    switch (priority) {
      case "urgente": return <Badge variant="destructive" className="text-[10px]">Urgente</Badge>;
      case "haute": return <Badge className="text-[10px] bg-orange-500 hover:bg-orange-600">Haute</Badge>;
      case "moyenne": return <Badge variant="secondary" className="text-[10px]">Moyenne</Badge>;
      default: return <Badge variant="outline" className="text-[10px]">Faible</Badge>;
    }
  };

  const getScoreColor = (g: number, p: number) => {
    const score = g * p;
    if (score >= 12) return "text-red-600 font-bold";
    if (score >= 8) return "text-orange-500 font-bold";
    if (score >= 4) return "text-yellow-600 font-semibold";
    return "text-green-600";
  };

  const riskLevelLabel = (score: number) => {
    if (score >= 12) return "Critique";
    if (score >= 8) return "Eleve";
    if (score >= 4) return "Modere";
    return "Faible";
  };

  const getActionStatusLabel = (status: string | null) => {
    switch (status) {
      case "en_cours": return <Badge className="text-[10px] bg-blue-500">En cours</Badge>;
      case "fait": return <Badge className="text-[10px] bg-green-600">Fait</Badge>;
      case "reporte": return <Badge variant="secondary" className="text-[10px]">Reporte</Badge>;
      default: return <Badge variant="outline" className="text-[10px]">A faire</Badge>;
    }
  };

  const dateFormatted = new Date(assessment.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/assessments")} data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold" data-testid="text-assessment-title">
              Document Unique — {company?.name || "..."}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={assessment.status === "completed" ? "default" : "secondary"}>
                {assessment.status === "completed" ? "Finalise" : "En cours"}
              </Badge>
              {sector && <Badge variant="outline" className="text-xs">{sector.name}</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {assessment.status !== "completed" && (
            <>
              <Link href={`/assessments/${id}/workflow`}>
                <Button size="sm" data-testid="button-continue">
                  <Play className="w-3.5 h-3.5 mr-1" /> Continuer
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={() => completeMutation.mutate()} data-testid="button-complete">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Finaliser
              </Button>
            </>
          )}
          <Button size="sm" variant="outline" onClick={handlePrint} data-testid="button-print">
            <Printer className="w-3.5 h-3.5 mr-1" /> Imprimer
          </Button>
          <Button variant="destructive" size="sm" onClick={() => {
            if (confirm("Supprimer cette evaluation ?")) deleteMutation.mutate();
          }} data-testid="button-delete">
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Supprimer
          </Button>
        </div>
      </div>

      {(!responses || responses.length === 0) && assessment.status !== "completed" && sector && (
        <Card className="border-primary/20 bg-primary/5 print:hidden">
          <CardContent className="p-6 text-center">
            <ShieldCheck className="w-10 h-10 mx-auto text-primary mb-3" />
            <h3 className="font-semibold text-sm">Commencer le questionnaire {sector.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Repondez aux questions du questionnaire OiRA pour identifier les risques professionnels de votre entreprise et generer votre Document Unique.
            </p>
            <Link href={`/assessments/${id}/workflow`}>
              <Button className="mt-4" data-testid="button-start-workflow">
                <Play className="w-4 h-4 mr-1" /> Demarrer le questionnaire
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 print:hidden" data-testid="tabs-report">
          <TabsTrigger value="rapport" className="text-xs" data-testid="tab-rapport">
            <FileText className="w-3.5 h-3.5 mr-1" /> Rapport DUERP
          </TabsTrigger>
          <TabsTrigger value="risques" className="text-xs" data-testid="tab-risques">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Risques
          </TabsTrigger>
          <TabsTrigger value="actions" className="text-xs" data-testid="tab-actions">
            <ListChecks className="w-3.5 h-3.5 mr-1" /> Plan d'action
          </TabsTrigger>
          <TabsTrigger value="mesures" className="text-xs" data-testid="tab-mesures">
            <Shield className="w-3.5 h-3.5 mr-1" /> Mesures
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rapport" className="space-y-4 mt-4">
          <div className="border-2 border-[#1e4a8a] rounded-lg overflow-hidden">
            <div className="bg-[#1e4a8a] p-6 text-white text-center">
              <h2 className="text-lg font-bold tracking-wide" data-testid="text-duerp-title">DOCUMENT UNIQUE D'EVALUATION DES RISQUES PROFESSIONNELS</h2>
              <p className="text-sm mt-1 opacity-90">Conformement aux articles R.4121-1 et suivants du Code du travail</p>
              <p className="text-xs mt-2 opacity-75">Methodologie INRS ED 840 / OiRA — {sector?.name || ""}</p>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2.5 border-r pr-4">
                  <h3 className="font-semibold text-[#1e4a8a] flex items-center gap-1.5 mb-2">
                    <Building2 className="w-4 h-4" /> Identification de l'entreprise
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <p><span className="text-muted-foreground">Raison sociale :</span> <span className="font-medium">{company?.name || "—"}</span></p>
                    {company?.siret && <p><span className="text-muted-foreground">SIRET :</span> <span className="font-mono">{company.siret}</span></p>}
                    {company?.address && <p><span className="text-muted-foreground">Adresse :</span> {company.address}{company.postalCode ? `, ${company.postalCode}` : ""} {company.city}</p>}
                    {company?.phone && <p><span className="text-muted-foreground">Telephone :</span> {company.phone}</p>}
                    {company?.email && <p><span className="text-muted-foreground">Email :</span> {company.email}</p>}
                    {company?.contactName && <p><span className="text-muted-foreground">Contact :</span> {company.contactName} {company.contactRole ? `(${company.contactRole})` : ""}</p>}
                    {company?.employeeCount !== null && company?.employeeCount !== undefined && (
                      <p><span className="text-muted-foreground">Effectif :</span> {company.employeeCount} salarie(s)</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2.5">
                  <h3 className="font-semibold text-[#1e4a8a] flex items-center gap-1.5 mb-2">
                    <ClipboardList className="w-4 h-4" /> Informations de l'evaluation
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    {sector && <p><span className="text-muted-foreground">Secteur d'activite :</span> <span className="font-medium">{sector.name}</span></p>}
                    {sector && <p><span className="text-muted-foreground">Outil OiRA :</span> {sector.code}</p>}
                    <p><span className="text-muted-foreground">Evaluateur :</span> {assessment.assessorName}</p>
                    <p><span className="text-muted-foreground">Date de l'evaluation :</span> {dateFormatted}</p>
                    <p><span className="text-muted-foreground">Statut :</span> {assessment.status === "completed" ? "Finalisee" : "En cours"}</p>
                    {assessment.notes && <p><span className="text-muted-foreground">Observations :</span> {assessment.notes}</p>}
                    <p className="mt-2 text-muted-foreground/70 italic">
                      Ce document doit etre mis a jour au moins une fois par an et lors de tout changement important affectant les conditions de travail.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-2 bg-muted/30">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Info className="w-4 h-4 text-[#1e4a8a]" /> Methodologie d'evaluation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 text-xs space-y-3">
              <p>L'evaluation des risques professionnels a ete realisee conformement a la methodologie <strong>INRS ED 840</strong> et a l'outil <strong>OiRA</strong> (Online interactive Risk Assessment) developpe par l'Agence europeenne pour la securite et la sante au travail (EU-OSHA).</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold text-[#1e4a8a] mb-2">Grille de gravite</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between"><span>1 — Faible</span><span className="text-muted-foreground">Dommage mineur, sans arret</span></div>
                    <div className="flex justify-between"><span>2 — Moyenne</span><span className="text-muted-foreground">Accident avec arret</span></div>
                    <div className="flex justify-between"><span>3 — Grave</span><span className="text-muted-foreground">Incapacite permanente partielle</span></div>
                    <div className="flex justify-between"><span>4 — Tres grave</span><span className="text-muted-foreground">Deces ou incapacite permanente</span></div>
                  </div>
                </div>
                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold text-[#1e4a8a] mb-2">Grille de probabilite</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between"><span>1 — Improbable</span><span className="text-muted-foreground">Tres rare, circonstances exceptionnelles</span></div>
                    <div className="flex justify-between"><span>2 — Possible</span><span className="text-muted-foreground">Peut se produire occasionnellement</span></div>
                    <div className="flex justify-between"><span>3 — Probable</span><span className="text-muted-foreground">Se produit regulierement</span></div>
                    <div className="flex justify-between"><span>4 — Tres probable</span><span className="text-muted-foreground">Quasi certain, frequence elevee</span></div>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground mt-2">
                <strong>Criticite = Gravite x Probabilite</strong> — Le score obtenu (de 1 a 16) permet de hierarchiser les risques et de definir les priorites d'action.
              </p>
            </CardContent>
          </Card>

          {stats && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Synthese globale de l'evaluation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-primary" data-testid="text-stat-completion">{stats.completionRate}%</p>
                    <p className="text-[11px] text-muted-foreground">Completion</p>
                    <p className="text-[10px] text-muted-foreground">{stats.answered}/{stats.totalQuestions}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-center">
                    <p className="text-2xl font-bold text-red-600" data-testid="text-stat-risks">{stats.risksYes}</p>
                    <p className="text-[11px] text-muted-foreground">Risques identifies</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
                    <p className="text-2xl font-bold text-green-600" data-testid="text-stat-ok">{stats.risksNo}</p>
                    <p className="text-[11px] text-muted-foreground">Points conformes</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
                    <p className="text-2xl font-bold text-blue-600" data-testid="text-stat-actions">{stats.withAction}</p>
                    <p className="text-[11px] text-muted-foreground">Actions planifiees</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-center">
                    <p className="text-2xl font-bold text-purple-600">{stats.withResponsible}</p>
                    <p className="text-[11px] text-muted-foreground">Responsables designes</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="p-2 rounded border border-red-200 text-center">
                    <p className="text-xs text-muted-foreground">Priorite urgente</p>
                    <p className="font-bold text-red-600">{stats.priorityCounts.urgente}</p>
                  </div>
                  <div className="p-2 rounded border border-orange-200 text-center">
                    <p className="text-xs text-muted-foreground">Priorite haute</p>
                    <p className="font-bold text-orange-500">{stats.priorityCounts.haute}</p>
                  </div>
                  <div className="p-2 rounded border border-yellow-200 text-center">
                    <p className="text-xs text-muted-foreground">Priorite moyenne</p>
                    <p className="font-bold text-yellow-600">{stats.priorityCounts.moyenne}</p>
                  </div>
                  <div className="p-2 rounded border border-green-200 text-center">
                    <p className="text-xs text-muted-foreground">Priorite faible</p>
                    <p className="font-bold text-green-600">{stats.priorityCounts.faible}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/30 grid grid-cols-3 gap-3 text-center text-xs">
                  <div>
                    <p className="text-muted-foreground">Gravite moyenne</p>
                    <p className="font-bold text-sm">{stats.avgGravity}/4</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Probabilite moyenne</p>
                    <p className="font-bold text-sm">{stats.avgProbability}/4</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Score moyen de criticite</p>
                    <p className="font-bold text-sm">{stats.avgScore}/16</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {risksIdentified.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#1e4a8a]" /> Matrice de criticite
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RiskMatrix responses={responses || []} />
              </CardContent>
            </Card>
          )}

          {moduleBreakdown.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Resultats par module thematique
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {moduleBreakdown.map((mod) => (
                    <div key={mod.name} className="p-3 flex items-center gap-3" data-testid={`module-result-${mod.name}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{mod.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {mod.answered}/{mod.total} questions repondues
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {mod.risks > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            {mod.risks} risque{mod.risks > 1 ? "s" : ""}
                          </Badge>
                        ) : mod.answered > 0 ? (
                          <Badge className="text-xs bg-green-600 hover:bg-green-700">Conforme</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Non evalue</Badge>
                        )}
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${mod.total > 0 ? (mod.answered / mod.total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="risques" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2 bg-red-50 dark:bg-red-950/10 rounded-t-lg">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" /> Vue d'ensemble des risques identifies
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {risksIdentified.length} risque{risksIdentified.length > 1 ? "s" : ""} identifie{risksIdentified.length > 1 ? "s" : ""} — classes par niveau de criticite decroissant
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {risksIdentified.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  Aucun risque identifie. Completez le questionnaire pour identifier les risques.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs" data-testid="table-risk-inventory">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-center p-2 font-medium w-8">#</th>
                        <th className="text-left p-2 font-medium">Module</th>
                        <th className="text-left p-2 font-medium">Situation dangereuse</th>
                        <th className="text-left p-2 font-medium">Dommage potentiel</th>
                        <th className="text-center p-2 font-medium">G</th>
                        <th className="text-center p-2 font-medium">P</th>
                        <th className="text-center p-2 font-medium">C</th>
                        <th className="text-center p-2 font-medium">Niveau</th>
                        <th className="text-center p-2 font-medium">Priorite</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...risksIdentified]
                        .sort((a, b) => ((b.gravityLevel || 1) * (b.probabilityLevel || 1)) - ((a.gravityLevel || 1) * (a.probabilityLevel || 1)))
                        .map((r, idx) => {
                          const g = r.gravityLevel || 1;
                          const p = r.probabilityLevel || 1;
                          const score = g * p;
                          return (
                            <tr key={r.id} className="border-b hover:bg-muted/30" data-testid={`row-risk-${r.id}`}>
                              <td className="p-2 text-center text-muted-foreground font-mono">{idx + 1}</td>
                              <td className="p-2 text-muted-foreground text-[11px]">{getQuestionModule(r.questionId)}</td>
                              <td className="p-2 max-w-[220px]">
                                <p className="font-medium">{getQuestionText(r.questionId)}</p>
                                {r.observations && <p className="text-muted-foreground mt-0.5 italic">{r.observations}</p>}
                              </td>
                              <td className="p-2 max-w-[180px] text-muted-foreground">
                                {getQuestionDescription(r.questionId) || "—"}
                              </td>
                              <td className="p-2 text-center font-mono font-semibold">{g}</td>
                              <td className="p-2 text-center font-mono font-semibold">{p}</td>
                              <td className={`p-2 text-center font-mono ${getScoreColor(g, p)}`}>{score}</td>
                              <td className="p-2 text-center">
                                <span className={`text-[10px] ${getScoreColor(g, p)}`}>{riskLevelLabel(score)}</span>
                              </td>
                              <td className="p-2 text-center">{getPriorityBadge(r.priority)}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {moduleBreakdown.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ClipboardList className="w-4 h-4" /> Detail par module
              </h3>
              {moduleBreakdown.map((mod) => (
                <Card key={mod.name}>
                  <CardHeader className="py-2 px-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-semibold">{mod.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {mod.risks > 0 && <Badge variant="destructive" className="text-[10px]">{mod.risks} risque{mod.risks > 1 ? "s" : ""}</Badge>}
                        <span className="text-[10px] text-muted-foreground">{mod.answered}/{mod.total}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {mod.questions.map(({ q, r }) => (
                        <div key={q.id} className="px-3 py-2 flex items-start gap-2 text-xs" data-testid={`detail-q-${q.id}`}>
                          {r?.response === true ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                          ) : r?.response === false ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <div className="w-3.5 h-3.5 border rounded-full flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={r?.response === true ? "font-medium text-red-700 dark:text-red-400" : ""}>{q.question}</p>
                            {r?.response === true && (
                              <div className="mt-1 text-[11px] text-muted-foreground space-y-0.5">
                                {q.description && <p>Risque : {q.description}</p>}
                                <p className="flex gap-2">
                                  <span>G:{r.gravityLevel || 1}</span>
                                  <span>P:{r.probabilityLevel || 1}</span>
                                  <span className={getScoreColor(r.gravityLevel || 1, r.probabilityLevel || 1)}>
                                    C:{(r.gravityLevel || 1) * (r.probabilityLevel || 1)}
                                  </span>
                                </p>
                                {r.observations && <p className="italic">Note : {r.observations}</p>}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {responses && responses.filter((r) => r.response === false).length > 0 && (
            <Card>
              <CardHeader className="pb-2 bg-green-50 dark:bg-green-950/10 rounded-t-lg">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-green-700 dark:text-green-400">
                  <ShieldCheck className="w-4 h-4" /> Points de conformite ({responses.filter((r) => r.response === false).length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y max-h-[400px] overflow-y-auto">
                  {responses.filter((r) => r.response === false).map((r) => (
                    <div key={r.id} className="p-2.5 flex items-center gap-2 text-xs" data-testid={`row-conform-${r.id}`}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                      <span className="text-muted-foreground text-[10px] min-w-[100px]">{getQuestionModule(r.questionId)}</span>
                      <span>{getQuestionText(r.questionId)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="actions" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2 bg-blue-50 dark:bg-blue-950/10 rounded-t-lg">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <TrendingDown className="w-4 h-4" /> Plan d'action de prevention
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Actions de prevention a mettre en oeuvre, classees par priorite — Conformement a l'article L.4121-3-1 du Code du travail
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {risksIdentified.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Aucun risque identifie. Completez le questionnaire pour generer le plan d'action.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs" data-testid="table-action-plan">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-center p-2 font-medium w-8">#</th>
                        <th className="text-left p-2 font-medium">Situation dangereuse</th>
                        <th className="text-left p-2 font-medium">Mesure de prevention suggeree</th>
                        <th className="text-left p-2 font-medium">Action decidee</th>
                        <th className="text-left p-2 font-medium">Responsable</th>
                        <th className="text-left p-2 font-medium">Delai</th>
                        <th className="text-left p-2 font-medium">Budget</th>
                        <th className="text-center p-2 font-medium">Priorite</th>
                        <th className="text-center p-2 font-medium">Statut</th>
                        <th className="text-center p-2 font-medium">C</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...risksIdentified]
                        .sort((a, b) => {
                          const priorityOrder: Record<string, number> = { urgente: 0, haute: 1, moyenne: 2, faible: 3 };
                          const pa = priorityOrder[a.priority || "faible"] ?? 3;
                          const pb = priorityOrder[b.priority || "faible"] ?? 3;
                          if (pa !== pb) return pa - pb;
                          return ((b.gravityLevel || 1) * (b.probabilityLevel || 1)) - ((a.gravityLevel || 1) * (a.probabilityLevel || 1));
                        })
                        .map((r, idx) => {
                          const g = r.gravityLevel || 1;
                          const p = r.probabilityLevel || 1;
                          return (
                            <tr key={r.id} className="border-b hover:bg-muted/30" data-testid={`row-action-${r.id}`}>
                              <td className="p-2 text-center text-muted-foreground">{idx + 1}</td>
                              <td className="p-2 max-w-[160px]">
                                <p className="font-medium">{getQuestionText(r.questionId)}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{getQuestionModule(r.questionId)}</p>
                              </td>
                              <td className="p-2 max-w-[160px] text-muted-foreground">
                                {getQuestionPrevention(r.questionId) || "—"}
                              </td>
                              <td className="p-2 max-w-[160px]">
                                {r.actionPlan ? (
                                  <p className="text-blue-700 dark:text-blue-400">{r.actionPlan}</p>
                                ) : (
                                  <span className="text-muted-foreground/50 italic">A completer</span>
                                )}
                              </td>
                              <td className="p-2 max-w-[100px]">
                                {r.responsible || <span className="text-muted-foreground/50 italic">—</span>}
                              </td>
                              <td className="p-2 max-w-[80px]">
                                {r.deadline || <span className="text-muted-foreground/50 italic">—</span>}
                              </td>
                              <td className="p-2 max-w-[80px]">
                                {r.budget || <span className="text-muted-foreground/50 italic">—</span>}
                              </td>
                              <td className="p-2 text-center">{getPriorityBadge(r.priority)}</td>
                              <td className="p-2 text-center">{getActionStatusLabel(r.actionStatus)}</td>
                              <td className={`p-2 text-center font-mono ${getScoreColor(g, p)}`}>{g * p}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {risksIdentified.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Suivi du plan d'action</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 border rounded-lg">
                    <p className="text-lg font-bold">{risksIdentified.filter((r) => r.actionStatus === "fait").length}</p>
                    <p className="text-muted-foreground">Actions realisees</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-lg font-bold text-blue-600">{risksIdentified.filter((r) => r.actionStatus === "en_cours").length}</p>
                    <p className="text-muted-foreground">En cours</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-lg font-bold text-yellow-600">{risksIdentified.filter((r) => !r.actionStatus || r.actionStatus === "a_faire").length}</p>
                    <p className="text-muted-foreground">A faire</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-lg font-bold text-muted-foreground">{risksIdentified.filter((r) => r.actionStatus === "reporte").length}</p>
                    <p className="text-muted-foreground">Reportees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mesures" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2 bg-green-50 dark:bg-green-950/10 rounded-t-lg">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-green-700 dark:text-green-400">
                <Shield className="w-4 h-4" /> Vue d'ensemble des mesures de prevention
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Recapitulatif des mesures existantes et des mesures a mettre en oeuvre pour chaque risque identifie
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {risksIdentified.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Aucun risque identifie. Completez le questionnaire pour voir les mesures de prevention.
                </div>
              ) : (
                <div className="divide-y">
                  {[...risksIdentified]
                    .sort((a, b) => {
                      const priorityOrder: Record<string, number> = { urgente: 0, haute: 1, moyenne: 2, faible: 3 };
                      return (priorityOrder[a.priority || "faible"] ?? 3) - (priorityOrder[b.priority || "faible"] ?? 3);
                    })
                    .map((r, idx) => {
                      const g = r.gravityLevel || 1;
                      const p = r.probabilityLevel || 1;
                      const score = g * p;
                      return (
                        <div key={r.id} className="p-3 space-y-2" data-testid={`measure-${r.id}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] text-muted-foreground font-mono">#{idx + 1}</span>
                                <span className="text-[10px] text-muted-foreground">{getQuestionModule(r.questionId)}</span>
                                {getPriorityBadge(r.priority)}
                                <span className={`text-[10px] font-mono ${getScoreColor(g, p)}`}>C={score}</span>
                              </div>
                              <p className="text-xs font-medium">{getQuestionText(r.questionId)}</p>
                              {getQuestionDescription(r.questionId) && (
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  Dommage potentiel : {getQuestionDescription(r.questionId)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/20">
                              <p className="font-semibold text-blue-700 dark:text-blue-400 mb-0.5">Mesure de prevention recommandee :</p>
                              <p className="text-blue-900 dark:text-blue-300">{getQuestionPrevention(r.questionId) || "Pas de mesure specifiee"}</p>
                            </div>
                            <div className="p-2 rounded bg-muted/50">
                              <p className="font-semibold mb-0.5">Mesures existantes :</p>
                              <p>{r.existingMeasures || "Non renseignees"}</p>
                            </div>
                          </div>
                          {(r.actionPlan || r.responsible || r.deadline) && (
                            <div className="p-2 rounded bg-green-50 dark:bg-green-950/20 text-[11px]">
                              <p className="font-semibold text-green-700 dark:text-green-400 mb-0.5">Action decidee :</p>
                              {r.actionPlan && <p>{r.actionPlan}</p>}
                              <div className="flex gap-3 mt-1 text-muted-foreground">
                                {r.responsible && <span>Responsable : {r.responsible}</span>}
                                {r.deadline && <span>Delai : {r.deadline}</span>}
                                {r.budget && <span>Budget : {r.budget}</span>}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {responses && responses.filter((r) => r.response === false).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" /> Bonnes pratiques deja en place ({responses.filter((r) => r.response === false).length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y max-h-[300px] overflow-y-auto">
                  {responses.filter((r) => r.response === false).map((r) => (
                    <div key={r.id} className="px-3 py-2 flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span className="text-muted-foreground text-[10px] min-w-[80px]">{getQuestionModule(r.questionId)}</span>
                      <span>{getQuestionText(r.questionId)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="text-[10px] text-muted-foreground/50 text-center pb-6 space-y-0.5 border-t pt-4">
        <p className="font-medium">Document Unique d'Evaluation des Risques Professionnels (DUERP)</p>
        <p>Methodologie INRS ED 840 / OiRA — Secteur : {sector?.name || "Non defini"}</p>
        <p>Reference legale : Articles R.4121-1 a R.4121-4 du Code du travail</p>
        <p>Genere par Satis Consulting — {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
        <p className="mt-1">Ce document doit etre conserve pendant une duree de 40 ans a compter de son elaboration.</p>
      </div>
    </div>
  );
}
