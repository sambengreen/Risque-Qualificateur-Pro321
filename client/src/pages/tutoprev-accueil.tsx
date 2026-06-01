import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  UserCheck,
  Search,
  AlertTriangle,
  Shield,
  Lightbulb,
  Users,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
  X,
  FileText,
  Wrench,
  Heart,
  Truck,
  Package,
  Zap,
  UtensilsCrossed,
  Monitor,
  Sparkles,
  Cog,
  HardHat,
  TreePine,
  ShoppingBag,
  SprayCan,
  CookingPot,
} from "lucide-react";
import { useState, useMemo } from "react";
import type { PreventionResource } from "@shared/schema";

const SECTOR_ICONS: Record<string, any> = {
  "Reparation automobile": Wrench,
  "Aide a la personne": Heart,
  "Transport routier de marchandises": Truck,
  "Logistique": Package,
  "Metiers de l'energie du batiment": Zap,
  "Hotellerie-Restauration": UtensilsCrossed,
  "Travail de bureau": Monitor,
  "Metiers de la beaute": Sparkles,
  "Maintenance industrielle": Cog,
  "BTP": HardHat,
  "Metiers du bois": TreePine,
  "Commerce": ShoppingBag,
  "Metiers de la proprete": SprayCan,
  "Metiers de bouche": CookingPot,
};

export default function TutoprevAccueil() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const { data: allResources = [], isLoading } = useQuery<PreventionResource[]>({
    queryKey: ["/api/prevention-resources"],
  });

  const tutoprevResources = useMemo(() => {
    return allResources.filter(r => r.category === "TutoPrev' Accueil");
  }, [allResources]);

  const sectors = useMemo(() => {
    const sectorSet = new Set(tutoprevResources.map(r => r.sector));
    return Array.from(sectorSet).sort();
  }, [tutoprevResources]);

  const filteredResources = useMemo(() => {
    let results = tutoprevResources;
    if (selectedSector) {
      results = results.filter(r => r.sector === selectedSector);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter(r =>
        r.title.toLowerCase().includes(term) ||
        r.sector.toLowerCase().includes(term) ||
        r.summary.toLowerCase().includes(term) ||
        r.mainRisks?.some(risk => risk.toLowerCase().includes(term)) ||
        r.preventionActions?.some(action => action.toLowerCase().includes(term))
      );
    }
    return results;
  }, [tutoprevResources, selectedSector, searchTerm]);

  const toggleCard = (edNumber: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(edNumber)) {
        next.delete(edNumber);
      } else {
        next.add(edNumber);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1e4a8a] flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
              TutoPrev' Accueil
            </h1>
            <p className="text-sm text-muted-foreground">
              Collection INRS pour l'accueil et la formation des nouveaux arrivants en entreprise
            </p>
          </div>
        </div>
        <div className="mt-2 p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-[#1e4a8a] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">TutoPrev' Accueil</strong> est un outil INRS destine aux animateurs
              (formateurs, tuteurs, maitres d'apprentissage, charges de prevention) pour verifier les connaissances
              en sante et securite au travail des nouveaux arrivants (stagiaires, apprentis, interimaires, nouveaux
              embauches). Il permet d'identifier les lacunes et de mettre en place des actions de formation
              complementaires. Les 18-24 ans ont pres de 2 fois plus d'accidents du travail que la moyenne.
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par secteur, risque, action..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-tutoprev-accueil"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => setSearchTerm("")}
              data-testid="button-clear-search-accueil"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Badge
            variant={selectedSector === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedSector(null)}
            data-testid="filter-all-accueil"
          >
            Tous ({tutoprevResources.length})
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {sectors.map(sector => {
          const Icon = SECTOR_ICONS[sector] || FileText;
          const count = tutoprevResources.filter(r => r.sector === sector).length;
          return (
            <Badge
              key={sector}
              variant={selectedSector === sector ? "default" : "outline"}
              className="cursor-pointer flex items-center gap-1.5"
              onClick={() => setSelectedSector(selectedSector === sector ? null : sector)}
              data-testid={`filter-sector-accueil-${sector.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <Icon className="w-3 h-3" />
              {sector} ({count})
            </Badge>
          );
        })}
      </div>

      {filteredResources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-center">
              Aucun resultat pour votre recherche.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredResources.map(resource => {
            const isExpanded = expandedCards.has(resource.edNumber);
            const Icon = SECTOR_ICONS[resource.sector] || FileText;

            return (
              <Card
                key={resource.edNumber}
                className="flex flex-col"
                data-testid={`card-tutoprev-accueil-${resource.edNumber.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <CardContent className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#1e4a8a]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-[#1e4a8a]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm leading-tight">{resource.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {resource.edNumber}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {resource.edition}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {resource.summary}
                  </p>

                  {resource.keyStats && resource.keyStats.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {resource.keyStats.slice(0, 3).map((stat, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                          {stat}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {isExpanded && (
                    <div className="space-y-4 border-t pt-3">
                      {resource.mainRisks && resource.mainRisks.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                            Principaux risques couverts
                          </h4>
                          <ul className="space-y-1">
                            {resource.mainRisks.map((risk, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <span className="text-red-400 mt-0.5">•</span>
                                {risk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {resource.preventionActions && resource.preventionActions.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                            <Shield className="w-3.5 h-3.5 text-green-500" />
                            Actions de prevention
                          </h4>
                          <ul className="space-y-1">
                            {resource.preventionActions.map((action, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <span className="text-green-400 mt-0.5">•</span>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {resource.supportActors && resource.supportActors.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                            <Users className="w-3.5 h-3.5 text-blue-500" />
                            Partenaires
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {resource.supportActors.map((actor, i) => (
                              <Badge key={i} variant="outline" className="text-[10px]">
                                {actor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {resource.employeeSteps && resource.employeeSteps.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                            Etapes pour le nouvel arrivant
                          </h4>
                          <ul className="space-y-1">
                            {resource.employeeSteps.map((step, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <span className="text-amber-400 mt-0.5">{i + 1}.</span>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-auto pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex-1"
                      onClick={() => toggleCard(resource.edNumber)}
                      data-testid={`button-toggle-accueil-${resource.edNumber.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3 mr-1" />
                          Reduire
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3 mr-1" />
                          Voir le detail
                        </>
                      )}
                    </Button>
                    {resource.inrsUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        asChild
                        data-testid={`button-pdf-accueil-${resource.edNumber.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        <a href={resource.inrsUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="w-3 h-3 mr-1" />
                          PDF INRS
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="text-center text-xs text-muted-foreground pt-4 border-t">
        <p>
          Collection TutoPrev' Accueil — Source : INRS (Institut national de recherche et de securite)
        </p>
        <p className="mt-1">
          {filteredResources.length} fiche{filteredResources.length > 1 ? "s" : ""} affichee{filteredResources.length > 1 ? "s" : ""} sur {tutoprevResources.length}
        </p>
      </div>
    </div>
  );
}
