import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import {
  ClipboardCheck, ArrowRight, Building2, Plus, Play, AlertCircle,
  Factory, CheckCircle2,
} from "lucide-react";
import type { Assessment, Company, IndustrySector } from "@shared/schema";

export default function Assessments() {
  const [, navigate] = useLocation();
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [showSelector, setShowSelector] = useState(false);

  const { data: assessments, isLoading } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
  });

  const { data: companies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: sectors } = useQuery<IndustrySector[]>({
    queryKey: ["/api/sectors"],
  });

  const getCompany = (id: string) => companies?.find((c) => c.id === id);
  const getSector = (sectorId: string | null) => sectorId ? sectors?.find((s) => s.id === sectorId) : null;

  const handleStartAssessment = () => {
    if (!companies || companies.length === 0) {
      navigate("/companies/new");
      return;
    }
    if (companies.length === 1) {
      navigate(`/assessments/new/${companies[0].id}`);
      return;
    }
    setShowSelector(true);
  };

  const handleConfirmCompany = () => {
    if (selectedCompanyId) {
      navigate(`/assessments/new/${selectedCompanyId}`);
    }
  };

  const selectedCompany = companies?.find(c => c.id === selectedCompanyId);
  const selectedSector = selectedCompany ? getSector(selectedCompany.industrySectorId) : null;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight" data-testid="text-assessments-title">
            Evaluations des risques
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {assessments?.length || 0} evaluation(s)
          </p>
        </div>
        <Button onClick={handleStartAssessment} data-testid="button-new-assessment">
          <Plus className="w-4 h-4 mr-1.5" />
          Commencer l'evaluation
        </Button>
      </div>

      {showSelector && companies && companies.length > 1 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium">Selectionner l'entreprise a evaluer :</p>
            <p className="text-xs text-muted-foreground">
              Le questionnaire sectoriel OiRA correspondant au secteur d'activite de l'entreprise sera automatiquement selectionne.
            </p>
            <div className="flex gap-2">
              <Select onValueChange={setSelectedCompanyId} value={selectedCompanyId}>
                <SelectTrigger className="flex-1" data-testid="select-company-for-assessment">
                  <SelectValue placeholder="Choisir une entreprise..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => {
                    const sector = getSector(c.industrySectorId);
                    return (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                          <span>{c.name}</span>
                          {sector && (
                            <span className="text-muted-foreground text-xs">— {sector.name}</span>
                          )}
                          {!c.industrySectorId && (
                            <span className="text-destructive text-xs">— Aucun secteur</span>
                          )}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Button
                onClick={handleConfirmCompany}
                disabled={!selectedCompanyId || (!!selectedCompany && !selectedCompany.industrySectorId)}
                data-testid="button-confirm-company"
              >
                <Play className="w-4 h-4 mr-1" /> Demarrer
              </Button>
            </div>

            {selectedCompanyId && selectedCompany && (
              <div className="rounded-md border p-3 space-y-2">
                {selectedSector ? (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        Questionnaire : {selectedSector.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedSector.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-destructive">
                        Aucun secteur OiRA associe
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Modifiez l'entreprise pour lui attribuer un secteur d'activite avant de lancer l'evaluation.
                      </p>
                      <Link href={`/companies/${selectedCompanyId}/edit`}>
                        <Button variant="outline" size="sm" className="mt-2" data-testid="button-edit-company-sector">
                          Modifier l'entreprise
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShowSelector(false); setSelectedCompanyId(""); }}
              data-testid="button-cancel-selector"
            >
              Annuler
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : assessments && assessments.length > 0 ? (
        <div className="space-y-3">
          {assessments.map((assessment) => {
            const company = getCompany(assessment.companyId);
            const sector = company ? getSector(company.industrySectorId) : null;
            return (
              <Link key={assessment.id} href={`/assessments/${assessment.id}`}>
                <Card className="cursor-pointer hover-elevate" data-testid={`card-assessment-${assessment.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <ClipboardCheck className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm truncate">
                            {assessment.assessorName}
                          </h3>
                          <Badge variant={assessment.status === "completed" ? "default" : "secondary"} className="flex-shrink-0">
                            {assessment.status === "completed" ? "Termine" : "En cours"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {company && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" /> {company.name}
                            </span>
                          )}
                          {sector && (
                            <span className="flex items-center gap-1">
                              <Factory className="w-3 h-3" /> {sector.name}
                            </span>
                          )}
                          <span>
                            {new Date(assessment.date).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center">
            <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-muted-foreground text-sm">Aucune evaluation realisee</p>
            <p className="text-xs text-muted-foreground/60 mt-1 mb-4">
              {companies && companies.length > 0
                ? "Selectionnez une entreprise pour lancer le questionnaire sectoriel OiRA correspondant"
                : "Creez d'abord une entreprise, puis lancez une evaluation"
              }
            </p>
            <Button onClick={handleStartAssessment} data-testid="button-start-first-assessment">
              <Play className="w-4 h-4 mr-1.5" />
              {companies && companies.length > 0 ? "Commencer l'evaluation" : "Creer une entreprise"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
