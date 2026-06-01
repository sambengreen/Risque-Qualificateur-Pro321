import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import {
  ArrowLeft, Factory, ClipboardCheck, Shield,
  Lightbulb, Info, ChevronDown,
} from "lucide-react";
import type { IndustrySector, SectorQuestion } from "@shared/schema";

export default function SectorDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: sector, isLoading } = useQuery<IndustrySector>({
    queryKey: ["/api/sectors", id],
  });

  const { data: questions, isLoading: loadingQuestions } = useQuery<SectorQuestion[]>({
    queryKey: ["/api/sectors", id, "questions"],
  });

  const modules = useMemo(() => {
    if (!questions) return [];
    const moduleMap: Record<string, SectorQuestion[]> = {};
    questions.forEach((q) => {
      if (!moduleMap[q.module]) moduleMap[q.module] = [];
      moduleMap[q.module].push(q);
    });
    return Object.entries(moduleMap).map(([name, qs]) => ({ name, questions: qs }));
  }, [questions]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!sector) {
    return <div className="p-6 text-center text-muted-foreground">Secteur non trouve</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()} data-testid="button-back">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold" data-testid="text-sector-title">{sector.name}</h1>
          {sector.category && <Badge variant="secondary" className="mt-1 text-xs">{sector.category}</Badge>}
        </div>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Factory className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm">{sector.description}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {questions?.length || 0} question(s) reparties en {modules.length} module(s)
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ref. INRS: {sector.code}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {loadingQuestions ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((mod, modIdx) => (
            <Card key={mod.name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  {mod.name}
                  <Badge variant="secondary" className="text-[10px] ml-auto">
                    {mod.questions.length} question(s)
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {mod.questions.map((q, qIdx) => (
                    <div key={q.id} className="p-3 space-y-1.5" data-testid={`question-${q.id}`}>
                      <p className="text-sm">
                        <span className="text-muted-foreground font-mono text-xs mr-2">
                          {modIdx + 1}.{qIdx + 1}
                        </span>
                        {q.question}
                      </p>
                      {q.description && (
                        <p className="text-xs text-muted-foreground flex items-start gap-1 ml-6">
                          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {q.description}
                        </p>
                      )}
                      {q.preventionMeasure && (
                        <p className="text-xs text-green-700 dark:text-green-400 flex items-start gap-1 ml-6">
                          <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {q.preventionMeasure}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
