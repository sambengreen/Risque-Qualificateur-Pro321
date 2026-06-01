import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useMemo } from "react";
import {
  ArrowLeft, ArrowRight, Check, X, AlertTriangle,
  ShieldCheck, ChevronRight, Save, CheckCircle2,
  Info, Lightbulb,
} from "lucide-react";
import type { Assessment, Company, SectorQuestion, QuestionResponse, IndustrySector } from "@shared/schema";

export default function AssessmentWorkflow() {
  const params = useParams<{ id?: string; companyId?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentModule, setCurrentModule] = useState(0);
  const [assessorName, setAssessorName] = useState("");

  const isNew = !!params.companyId;
  const assessmentId = params.id;

  const { data: assessment } = useQuery<Assessment>({
    queryKey: ["/api/assessments", assessmentId],
    enabled: !!assessmentId,
  });

  const companyId = isNew ? params.companyId : assessment?.companyId;

  const { data: company } = useQuery<Company>({
    queryKey: ["/api/companies", companyId],
    enabled: !!companyId,
  });

  const { data: sectors } = useQuery<IndustrySector[]>({
    queryKey: ["/api/sectors"],
  });

  const sectorId = company?.industrySectorId;

  const { data: questions, isLoading: loadingQuestions } = useQuery<SectorQuestion[]>({
    queryKey: ["/api/sectors", sectorId, "questions"],
    enabled: !!sectorId,
  });

  const { data: existingResponses } = useQuery<QuestionResponse[]>({
    queryKey: ["/api/assessments", assessmentId, "responses"],
    enabled: !!assessmentId,
  });

  const [responses, setResponses] = useState<Record<string, {
    response: boolean | null;
    gravityLevel: number;
    probabilityLevel: number;
    priority: string;
    observations: string;
    actionPlan: string;
    responsible: string;
    deadline: string;
    budget: string;
    actionStatus: string;
    existingMeasures: string;
  }>>({});

  const modules = useMemo(() => {
    if (!questions) return [];
    const moduleMap: Record<string, SectorQuestion[]> = {};
    questions.forEach((q) => {
      if (!moduleMap[q.module]) moduleMap[q.module] = [];
      moduleMap[q.module].push(q);
    });
    return Object.entries(moduleMap).map(([name, qs]) => ({ name, questions: qs }));
  }, [questions]);

  const sector = sectors?.find((s) => s.id === sectorId);

  const createAssessmentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/assessments", {
        companyId,
        assessorName: assessorName || "Evaluateur",
        date: new Date().toISOString(),
        status: "in_progress",
      });
      return res.json();
    },
    onSuccess: (data: Assessment) => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      navigate(`/assessments/${data.id}/workflow`);
    },
  });

  const saveResponseMutation = useMutation({
    mutationFn: async ({ questionId, data }: { questionId: string; data: any }) => {
      const existing = existingResponses?.find((r) => r.questionId === questionId);
      if (existing) {
        return apiRequest("PATCH", `/api/responses/${existing.id}`, data);
      }
      return apiRequest("POST", "/api/responses", {
        assessmentId,
        questionId,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "responses"] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => apiRequest("PATCH", `/api/assessments/${assessmentId}`, { status: "completed" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      toast({ title: "Evaluation terminee avec succes !" });
      navigate(`/assessments/${assessmentId}`);
    },
  });

  const handleResponse = (questionId: string, value: boolean) => {
    const defaultResp = {
      response: null, gravityLevel: 1, probabilityLevel: 1, priority: "faible",
      observations: "", actionPlan: "", responsible: "", deadline: "", budget: "",
      actionStatus: "a_faire", existingMeasures: "",
    };
    const current = responses[questionId] || defaultResp;
    const updated = { ...current, response: value };
    setResponses({ ...responses, [questionId]: updated });
    if (assessmentId) {
      saveResponseMutation.mutate({
        questionId,
        data: {
          response: value,
          gravityLevel: updated.gravityLevel,
          probabilityLevel: updated.probabilityLevel,
          priority: updated.priority,
          observations: updated.observations,
          actionPlan: updated.actionPlan,
          responsible: updated.responsible,
          deadline: updated.deadline,
          budget: updated.budget,
          actionStatus: updated.actionStatus,
          existingMeasures: updated.existingMeasures,
        },
      });
    }
  };

  const handleFieldChange = (questionId: string, field: string, value: any) => {
    const current = responses[questionId] || {
      response: null, gravityLevel: 1, probabilityLevel: 1, priority: "faible",
      observations: "", actionPlan: "", responsible: "", deadline: "", budget: "",
      actionStatus: "a_faire", existingMeasures: "",
    };
    const updated = { ...current, [field]: value };
    setResponses({ ...responses, [questionId]: updated });
  };

  const saveFieldDebounced = (questionId: string, field: string, value: any) => {
    if (assessmentId) {
      const current = responses[questionId];
      if (current) {
        saveResponseMutation.mutate({
          questionId,
          data: { [field]: value },
        });
      }
    }
  };

  const getResponseForQuestion = (questionId: string) => {
    if (responses[questionId]) return responses[questionId];
    const existing = existingResponses?.find((r) => r.questionId === questionId);
    if (existing) return {
      response: existing.response,
      gravityLevel: existing.gravityLevel || 1,
      probabilityLevel: existing.probabilityLevel || 1,
      priority: existing.priority || "faible",
      observations: existing.observations || "",
      actionPlan: existing.actionPlan || "",
      responsible: existing.responsible || "",
      deadline: existing.deadline || "",
      budget: existing.budget || "",
      actionStatus: existing.actionStatus || "a_faire",
      existingMeasures: existing.existingMeasures || "",
    };
    return null;
  };

  if (isNew && !assessmentId) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()} data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">Nouvelle evaluation</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {company?.name || "..."}
              {sector && <Badge variant="secondary" className="ml-2 text-xs">{sector.name}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nom de l'evaluateur *</label>
              <Input
                placeholder="Votre nom"
                value={assessorName}
                onChange={(e) => setAssessorName(e.target.value)}
                data-testid="input-assessor-name"
              />
            </div>
            <Button
              className="w-full"
              disabled={!assessorName || createAssessmentMutation.isPending}
              onClick={() => createAssessmentMutation.mutate()}
              data-testid="button-start-assessment"
            >
              {createAssessmentMutation.isPending ? "Creation..." : "Demarrer l'evaluation"}
            </Button>
            {!sector && company && (
              <p className="text-xs text-destructive">
                Aucun secteur d'activite n'est associe a cette entreprise. Modifiez l'entreprise pour selectionner un secteur OiRA.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingQuestions) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const currentModuleData = modules[currentModule];
  const progress = modules.length > 0 ? ((currentModule + 1) / modules.length) * 100 : 0;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/assessments/${assessmentId}`)} data-testid="button-back">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate" data-testid="text-workflow-title">
            {company?.name}
          </h1>
          <p className="text-xs text-muted-foreground">
            {sector?.name} - Module {currentModule + 1}/{modules.length}
          </p>
        </div>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-3 flex items-start gap-3">
          <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Etape 2 — Identifier les risques :</strong> Repondez aux questions pour chaque module. Cliquez <strong>Oui</strong> si le risque est present, puis evaluez sa gravite et sa probabilite conformement a la methodologie INRS ED 840.
          </p>
        </CardContent>
      </Card>

      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
          data-testid="progress-bar"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {modules.map((mod, idx) => (
          <Button
            key={mod.name}
            variant={idx === currentModule ? "default" : "outline"}
            size="sm"
            className="flex-shrink-0 text-xs"
            onClick={() => setCurrentModule(idx)}
            data-testid={`button-module-${idx}`}
          >
            {mod.name}
          </Button>
        ))}
      </div>

      {currentModuleData && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-base">{currentModuleData.name}</h2>
          </div>

          {currentModuleData.questions.map((question) => {
            const resp = getResponseForQuestion(question.id);
            const isRisk = resp?.response === true;

            return (
              <Card
                key={question.id}
                className={`transition-all ${isRisk ? "border-destructive/30 bg-destructive/5" : resp?.response === false ? "border-green-500/20 bg-green-50/50 dark:bg-green-950/10" : ""}`}
                data-testid={`card-question-${question.id}`}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-relaxed">
                        {question.question}
                      </p>
                      {question.description && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {question.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <Button
                        size="sm"
                        variant={resp?.response === true ? "destructive" : "outline"}
                        className="h-8 px-3 text-xs"
                        onClick={() => handleResponse(question.id, true)}
                        data-testid={`button-yes-${question.id}`}
                      >
                        <AlertTriangle className="w-3 h-3 mr-1" /> Oui
                      </Button>
                      <Button
                        size="sm"
                        variant={resp?.response === false ? "default" : "outline"}
                        className={`h-8 px-3 text-xs ${resp?.response === false ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                        onClick={() => handleResponse(question.id, false)}
                        data-testid={`button-no-${question.id}`}
                      >
                        <Check className="w-3 h-3 mr-1" /> Non
                      </Button>
                    </div>
                  </div>

                  {isRisk && (
                    <div className="pt-2 border-t border-destructive/20 space-y-3">
                      {question.preventionMeasure && (
                        <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                          <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">Mesure de prevention suggeree</p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">{question.preventionMeasure}</p>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Gravite</label>
                          <Select
                            value={String(resp?.gravityLevel || 1)}
                            onValueChange={(v) => {
                              handleFieldChange(question.id, "gravityLevel", parseInt(v));
                              saveFieldDebounced(question.id, "gravityLevel", parseInt(v));
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs" data-testid={`select-gravity-${question.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 - Faible</SelectItem>
                              <SelectItem value="2">2 - Moyenne</SelectItem>
                              <SelectItem value="3">3 - Grave</SelectItem>
                              <SelectItem value="4">4 - Tres grave</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Probabilite</label>
                          <Select
                            value={String(resp?.probabilityLevel || 1)}
                            onValueChange={(v) => {
                              handleFieldChange(question.id, "probabilityLevel", parseInt(v));
                              saveFieldDebounced(question.id, "probabilityLevel", parseInt(v));
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs" data-testid={`select-probability-${question.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 - Improbable</SelectItem>
                              <SelectItem value="2">2 - Possible</SelectItem>
                              <SelectItem value="3">3 - Probable</SelectItem>
                              <SelectItem value="4">4 - Tres probable</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Priorite</label>
                          <Select
                            value={resp?.priority || "faible"}
                            onValueChange={(v) => {
                              handleFieldChange(question.id, "priority", v);
                              saveFieldDebounced(question.id, "priority", v);
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs" data-testid={`select-priority-${question.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="faible">Faible</SelectItem>
                              <SelectItem value="moyenne">Moyenne</SelectItem>
                              <SelectItem value="haute">Haute</SelectItem>
                              <SelectItem value="urgente">Urgente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Observations</label>
                        <Textarea
                          className="text-xs min-h-[60px]"
                          placeholder="Decrivez la situation observee..."
                          value={resp?.observations || ""}
                          onChange={(e) => handleFieldChange(question.id, "observations", e.target.value)}
                          onBlur={(e) => saveFieldDebounced(question.id, "observations", e.target.value)}
                          data-testid={`textarea-observations-${question.id}`}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Mesures de prevention existantes</label>
                        <Textarea
                          className="text-xs min-h-[50px]"
                          placeholder="Mesures deja en place dans l'entreprise..."
                          value={resp?.existingMeasures || ""}
                          onChange={(e) => handleFieldChange(question.id, "existingMeasures", e.target.value)}
                          onBlur={(e) => saveFieldDebounced(question.id, "existingMeasures", e.target.value)}
                          data-testid={`textarea-existing-${question.id}`}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Action de prevention decidee</label>
                        <Textarea
                          className="text-xs min-h-[50px]"
                          placeholder="Actions de prevention a mettre en place..."
                          value={resp?.actionPlan || ""}
                          onChange={(e) => handleFieldChange(question.id, "actionPlan", e.target.value)}
                          onBlur={(e) => saveFieldDebounced(question.id, "actionPlan", e.target.value)}
                          data-testid={`textarea-action-${question.id}`}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Responsable</label>
                          <Input
                            className="h-8 text-xs"
                            placeholder="Nom du responsable"
                            value={resp?.responsible || ""}
                            onChange={(e) => handleFieldChange(question.id, "responsible", e.target.value)}
                            onBlur={(e) => saveFieldDebounced(question.id, "responsible", e.target.value)}
                            data-testid={`input-responsible-${question.id}`}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Delai</label>
                          <Input
                            className="h-8 text-xs"
                            placeholder="Ex: 3 mois, Juin 2026"
                            value={resp?.deadline || ""}
                            onChange={(e) => handleFieldChange(question.id, "deadline", e.target.value)}
                            onBlur={(e) => saveFieldDebounced(question.id, "deadline", e.target.value)}
                            data-testid={`input-deadline-${question.id}`}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Budget estime</label>
                          <Input
                            className="h-8 text-xs"
                            placeholder="Ex: 500 EUR"
                            value={resp?.budget || ""}
                            onChange={(e) => handleFieldChange(question.id, "budget", e.target.value)}
                            onBlur={(e) => saveFieldDebounced(question.id, "budget", e.target.value)}
                            data-testid={`input-budget-${question.id}`}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {(!questions || questions.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucun questionnaire disponible pour ce secteur.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Verifiez que l'entreprise est associee a un secteur OiRA.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-2 pb-6">
        <Button
          variant="outline"
          disabled={currentModule === 0}
          onClick={() => setCurrentModule(Math.max(0, currentModule - 1))}
          data-testid="button-prev-module"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Precedent
        </Button>

        {currentModule < modules.length - 1 ? (
          <Button
            onClick={() => setCurrentModule(currentModule + 1)}
            data-testid="button-next-module"
          >
            Suivant <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={() => completeMutation.mutate()}
            disabled={completeMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
            data-testid="button-finish"
          >
            <CheckCircle2 className="w-4 h-4 mr-1" /> Terminer l'evaluation
          </Button>
        )}
      </div>
    </div>
  );
}
