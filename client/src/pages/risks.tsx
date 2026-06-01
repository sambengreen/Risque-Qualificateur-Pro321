import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Shield, Lightbulb, ChevronDown, ChevronUp, BookOpen, Search, TriangleAlert, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { RiskCategory } from "@shared/schema";

function getReferenceLink(ref: string): { label: string; url: string | null } {
  const edMatch = ref.match(/ED\s*(\d+)/i);
  if (edMatch) {
    const edNumber = edMatch[1];
    return {
      label: ref,
      url: `https://www.inrs.fr/media.html?refINRS=ED+${edNumber}`,
    };
  }
  const nsMatch = ref.match(/NS\s*(\d+)/i);
  if (nsMatch) {
    const nsNumber = nsMatch[1];
    return {
      label: ref,
      url: `https://www.inrs.fr/media.html?refINRS=NS+${nsNumber}`,
    };
  }
  const doMatch = ref.match(/DO\s*(\d+)/i);
  if (doMatch) {
    const doNumber = doMatch[1];
    return {
      label: ref,
      url: `https://www.inrs.fr/media.html?refINRS=DO+${doNumber}`,
    };
  }
  const urlMatch = ref.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/);
  if (urlMatch) {
    const cleanUrl = urlMatch[1].startsWith("http") ? urlMatch[1] : `https://${urlMatch[1]}`;
    return { label: ref.replace(urlMatch[1], "").trim().replace(/[:\s]+$/, ""), url: cleanUrl };
  }
  const inrsDossier = ref.match(/Dossier web (.+?) \(INRS\)/i);
  if (inrsDossier) {
    return {
      label: ref,
      url: `https://www.inrs.fr/risques/${inrsDossier[1].toLowerCase().replace(/\s+/g, "-").replace(/[éè]/g, "e").replace(/[àâ]/g, "a")}.html`,
    };
  }
  return { label: ref, url: null };
}

export default function Risks() {
  const { data: categories, isLoading } = useQuery<RiskCategory[]>({
    queryKey: ["/api/risk-categories"],
  });

  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = categories?.filter((cat) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      cat.name.toLowerCase().includes(s) ||
      cat.description.toLowerCase().includes(s) ||
      cat.examples?.some((e) => e.toLowerCase().includes(s)) ||
      cat.dangerousSituations?.some((d) => d.toLowerCase().includes(s))
    );
  });

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight" data-testid="text-risks-title">
            Familles de risques - INRS ED 840
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          20 familles de risques professionnels selon le document officiel INRS ED 840 (octobre 2023).
          Aide au reperage des risques dans les PME-PMI.
        </p>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <p className="text-xs text-blue-800 dark:text-blue-300">
          Chaque fiche presente les situations dangereuses a identifier dans votre entreprise et les mesures de prevention
          recommandees par l'INRS. Cliquez sur une famille pour voir le detail complet.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une famille de risques..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-testid="input-search-risks"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered?.map((cat) => {
            const isExpanded = expanded === cat.id;
            return (
              <Card
                key={cat.id}
                className="cursor-pointer hover:shadow-md transition-all border-l-4"
                style={{ borderLeftColor: cat.color || "#1e4a8a" }}
                onClick={() => setExpanded(isExpanded ? null : cat.id)}
                data-testid={`card-risk-${cat.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-white text-sm"
                      style={{ backgroundColor: cat.color || "#1e4a8a" }}
                    >
                      {cat.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-sm" data-testid={`text-risk-name-${cat.id}`}>
                          Fiche {cat.number} - {cat.name}
                        </h3>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {cat.description}
                      </p>

                      {isExpanded && (
                        <div className="mt-4 space-y-4" onClick={(e) => e.stopPropagation()}>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {cat.description}
                            </p>
                          </div>

                          {cat.dangerousSituations && cat.dangerousSituations.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold flex items-center gap-1.5 mb-2 text-red-700 dark:text-red-400">
                                <TriangleAlert className="w-3.5 h-3.5" />
                                Situations dangereuses a identifier
                              </p>
                              <ul className="space-y-1.5 ml-1">
                                {cat.dangerousSituations.map((sit, i) => (
                                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                    <span className="text-red-500 mt-0.5 flex-shrink-0">&#9679;</span>
                                    {sit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {cat.examples && cat.examples.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                                Exemples de dangers
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {cat.examples.map((ex, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px]">
                                    {ex}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {cat.preventionMeasures && cat.preventionMeasures.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold flex items-center gap-1.5 mb-2 text-green-700 dark:text-green-400">
                                <Lightbulb className="w-3.5 h-3.5" />
                                Mesures de prevention recommandees
                              </p>
                              <ul className="space-y-1.5 ml-1">
                                {cat.preventionMeasures.map((m, i) => (
                                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5 flex-shrink-0">&#10003;</span>
                                    {m}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {cat.references && cat.references.length > 0 && (
                            <div className="pt-2 border-t">
                              <p className="text-xs font-semibold flex items-center gap-1.5 mb-2 text-blue-700 dark:text-blue-400">
                                <BookOpen className="w-3.5 h-3.5" />
                                References INRS
                              </p>
                              <ul className="space-y-1.5 ml-1">
                                {cat.references.map((ref, i) => {
                                  const link = getReferenceLink(ref);
                                  return (
                                    <li key={i} className="text-xs flex items-start gap-2">
                                      <BookOpen className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                                      {link.url ? (
                                        <a
                                          href={link.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                                          data-testid={`link-reference-${cat.id}-${i}`}
                                        >
                                          {link.label}
                                          <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                                        </a>
                                      ) : (
                                        <span className="text-blue-600 dark:text-blue-400">{link.label}</span>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filtered?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Aucune famille de risques ne correspond a votre recherche.
            </div>
          )}
        </div>
      )}

      <div className="text-center pt-4 pb-2">
        <p className="text-[10px] text-muted-foreground">
          Source : INRS - Brochure ED 840 (8e edition, octobre 2023) - Aide au reperage des risques dans les PME-PMI
        </p>
      </div>
    </div>
  );
}
