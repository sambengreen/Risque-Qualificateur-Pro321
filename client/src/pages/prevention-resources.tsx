import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  FileText,
  Search,
  AlertTriangle,
  Shield,
  Lightbulb,
  Users,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
  Eye,
  X,
  Pencil,
  Save,
  Library,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import type { PreventionResource } from "@shared/schema";

function highlightText(text: string, keywords: string[]) {
  if (!keywords.length || !text) return text;
  const regex = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 text-foreground px-0.5 rounded-sm">{part}</mark>
    ) : (
      part
    )
  );
}

function EditResourceDialog({
  resource,
  open,
  onOpenChange,
}: {
  resource: PreventionResource;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: resource.title,
    edNumber: resource.edNumber,
    sector: resource.sector,
    category: resource.category,
    edition: resource.edition || "",
    summary: resource.summary || "",
    inrsUrl: resource.inrsUrl || "",
    keyStats: Array.isArray(resource.keyStats) ? (resource.keyStats as string[]).join("\n") : "",
    mainRisks: Array.isArray(resource.mainRisks) ? (resource.mainRisks as string[]).join("\n") : "",
    preventionActions: Array.isArray(resource.preventionActions) ? (resource.preventionActions as string[]).join("\n") : "",
    supportActors: Array.isArray(resource.supportActors) ? (resource.supportActors as string[]).join("\n") : "",
    employeeSteps: Array.isArray(resource.employeeSteps) ? (resource.employeeSteps as string[]).join("\n") : "",
    references: Array.isArray(resource.references) ? (resource.references as string[]).join("\n") : "",
  });

  const mutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("PATCH", `/api/prevention-resources/${resource.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prevention-resources"] });
      toast({ title: "Fiche mise a jour", description: `${formData.edNumber} - ${formData.title}` });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre a jour la fiche", variant: "destructive" });
    },
  });

  const handleSave = () => {
    const toArray = (val: string) => val.split("\n").map(s => s.trim()).filter(Boolean);
    mutation.mutate({
      title: formData.title,
      edNumber: formData.edNumber,
      sector: formData.sector,
      category: formData.category,
      edition: formData.edition || null,
      summary: formData.summary || null,
      inrsUrl: formData.inrsUrl || null,
      keyStats: toArray(formData.keyStats),
      mainRisks: toArray(formData.mainRisks),
      preventionActions: toArray(formData.preventionActions),
      supportActors: toArray(formData.supportActors),
      employeeSteps: toArray(formData.employeeSteps),
      references: toArray(formData.references),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-[#1e4a8a]" />
            Modifier la fiche {resource.edNumber}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Numero ED</Label>
              <Input
                value={formData.edNumber}
                onChange={(e) => setFormData(p => ({ ...p, edNumber: e.target.value }))}
                data-testid="input-edit-edNumber"
              />
            </div>
            <div>
              <Label className="text-xs">Edition</Label>
              <Input
                value={formData.edition}
                onChange={(e) => setFormData(p => ({ ...p, edition: e.target.value }))}
                data-testid="input-edit-edition"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Titre</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
              data-testid="input-edit-title"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Secteur</Label>
              <Input
                value={formData.sector}
                onChange={(e) => setFormData(p => ({ ...p, sector: e.target.value }))}
                data-testid="input-edit-sector"
              />
            </div>
            <div>
              <Label className="text-xs">Categorie</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                data-testid="input-edit-category"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Resume</Label>
            <Textarea
              value={formData.summary}
              onChange={(e) => setFormData(p => ({ ...p, summary: e.target.value }))}
              rows={3}
              data-testid="input-edit-summary"
            />
          </div>
          <div>
            <Label className="text-xs">URL INRS</Label>
            <Input
              value={formData.inrsUrl}
              onChange={(e) => setFormData(p => ({ ...p, inrsUrl: e.target.value }))}
              data-testid="input-edit-inrsUrl"
            />
          </div>
          <div>
            <Label className="text-xs">Chiffres cles (un par ligne)</Label>
            <Textarea
              value={formData.keyStats}
              onChange={(e) => setFormData(p => ({ ...p, keyStats: e.target.value }))}
              rows={3}
              placeholder="Un chiffre cle par ligne"
              data-testid="input-edit-keyStats"
            />
          </div>
          <div>
            <Label className="text-xs">Risques principaux (un par ligne)</Label>
            <Textarea
              value={formData.mainRisks}
              onChange={(e) => setFormData(p => ({ ...p, mainRisks: e.target.value }))}
              rows={4}
              placeholder="Un risque par ligne"
              data-testid="input-edit-mainRisks"
            />
          </div>
          <div>
            <Label className="text-xs">Actions de prevention (une par ligne)</Label>
            <Textarea
              value={formData.preventionActions}
              onChange={(e) => setFormData(p => ({ ...p, preventionActions: e.target.value }))}
              rows={4}
              placeholder="Une action par ligne"
              data-testid="input-edit-preventionActions"
            />
          </div>
          <div>
            <Label className="text-xs">Acteurs de soutien (un par ligne)</Label>
            <Textarea
              value={formData.supportActors}
              onChange={(e) => setFormData(p => ({ ...p, supportActors: e.target.value }))}
              rows={2}
              placeholder="Un acteur par ligne"
              data-testid="input-edit-supportActors"
            />
          </div>
          <div>
            <Label className="text-xs">Etapes pour le salarie (une par ligne)</Label>
            <Textarea
              value={formData.employeeSteps}
              onChange={(e) => setFormData(p => ({ ...p, employeeSteps: e.target.value }))}
              rows={3}
              placeholder="Une etape par ligne"
              data-testid="input-edit-employeeSteps"
            />
          </div>
          <div>
            <Label className="text-xs">References (une par ligne)</Label>
            <Textarea
              value={formData.references}
              onChange={(e) => setFormData(p => ({ ...p, references: e.target.value }))}
              rows={2}
              placeholder="Une reference par ligne"
              data-testid="input-edit-references"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-edit">
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={mutation.isPending}
            data-testid="button-save-edit"
          >
            <Save className="w-4 h-4 mr-1" />
            {mutation.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PreventionResources() {
  const { data: resources, isLoading } = useQuery<PreventionResource[]>({
    queryKey: ["/api/prevention-resources"],
  });

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingResource, setEditingResource] = useState<PreventionResource | null>(null);

  const searchKeywords = useMemo(() => {
    return search.trim().toLowerCase().split(/\s+/).filter(k => k.length >= 2);
  }, [search]);

  const categories = useMemo(() => {
    if (!resources) return [];
    const cats = [...new Set(resources.map((r) => r.category))];
    return cats.sort();
  }, [resources]);

  const sectors = useMemo(() => {
    if (!resources) return [];
    const secs = [...new Set(resources.map((r) => r.sector))];
    return secs.sort();
  }, [resources]);

  const filtered = useMemo(() => {
    if (!resources) return [];
    return resources
      .map((r) => {
        const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;
        const matchesSector = sectorFilter === "all" || r.sector === sectorFilter;
        if (!matchesCategory || !matchesSector) return null;

        if (searchKeywords.length === 0) return { resource: r, score: 0 };

        const allText = [
          r.edNumber, r.title, r.sector, r.category, r.summary || "",
          ...(Array.isArray(r.keyStats) ? r.keyStats as string[] : []),
          ...(Array.isArray(r.mainRisks) ? r.mainRisks as string[] : []),
          ...(Array.isArray(r.preventionActions) ? r.preventionActions as string[] : []),
          ...(Array.isArray(r.supportActors) ? r.supportActors as string[] : []),
          ...(Array.isArray(r.employeeSteps) ? r.employeeSteps as string[] : []),
          ...(Array.isArray(r.references) ? r.references as string[] : []),
        ].join(" ").toLowerCase();

        let score = 0;
        for (const kw of searchKeywords) {
          if (!allText.includes(kw)) return null;
          if (r.title.toLowerCase().includes(kw)) score += 3;
          if (r.edNumber.toLowerCase().includes(kw)) score += 3;
          if (r.category.toLowerCase().includes(kw)) score += 2;
          if (r.sector.toLowerCase().includes(kw)) score += 2;
          if (r.summary?.toLowerCase().includes(kw)) score += 1;
          score += 1;
        }
        return { resource: r, score };
      })
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score)
      .map((item) => item!.resource);
  }, [resources, searchKeywords, categoryFilter, sectorFilter]);

  const pdfUrl = useCallback((resource: PreventionResource) => {
    if (resource.pdfFileName) {
      return `/api/pdfs/${resource.pdfFileName}`;
    }
    return null;
  }, []);

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setSectorFilter("all");
  };

  const hasActiveFilters = search !== "" || categoryFilter !== "all" || sectorFilter !== "all";

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#1e4a8a] flex items-center justify-center flex-shrink-0">
          <Library className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight" data-testid="text-prevention-title">
            Base de connaissances INRS
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {resources?.length || 0} fiches de reference — Recherchez, consultez et editez les fiches INRS
          </p>
        </div>
      </div>

      <Card className="border-[#1e4a8a]/20">
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1e4a8a]" />
            <Input
              placeholder="Rechercher : restauration, hotellerie, chutes, brulures, cuisines, TMS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 text-base border-[#1e4a8a]/30 focus-visible:ring-[#1e4a8a]"
              data-testid="input-search-prevention"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                data-testid="button-clear-search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[240px]" data-testid="select-category-filter">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Toutes les categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-full sm:w-[240px]" data-testid="select-sector-filter">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Tous les secteurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les secteurs</SelectItem>
                {sectors.map((sec) => (
                  <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs" data-testid="button-clear-filters">
                <X className="w-3 h-3 mr-1" />
                Effacer les filtres
              </Button>
            )}
          </div>
          {searchKeywords.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {filtered.length} resultat{filtered.length !== 1 ? "s" : ""} pour « {search.trim()} »
            </p>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">Aucune fiche ne correspond a votre recherche</p>
            <p className="text-xs text-muted-foreground mt-1">
              Essayez d'autres mots-cles ou modifiez vos filtres
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((resource) => {
            const isExpanded = expanded === resource.id;
            const pdf = pdfUrl(resource);
            return (
              <Card
                key={resource.id}
                className="hover-elevate transition-all"
                data-testid={`card-prevention-${resource.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1e4a8a] flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className="flex items-center gap-2 min-w-0 cursor-pointer flex-1"
                          onClick={() => setExpanded(isExpanded ? null : resource.id)}
                        >
                          <Badge
                            variant="secondary"
                            className="text-[10px] flex-shrink-0 bg-[#1e4a8a]/10 text-[#1e4a8a] dark:bg-[#1e4a8a]/20 dark:text-blue-300"
                          >
                            {resource.edNumber}
                          </Badge>
                          <h3 className="font-semibold text-sm truncate" data-testid={`text-prevention-name-${resource.id}`}>
                            {searchKeywords.length > 0 ? highlightText(resource.title, searchKeywords) : resource.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); setEditingResource(resource); }}
                            title="Modifier la fiche"
                            data-testid={`button-edit-${resource.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {pdf && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); window.open(pdf, "_blank"); }}
                                title="Voir le PDF"
                                data-testid={`button-view-pdf-${resource.id}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const a = document.createElement("a");
                                  a.href = pdf;
                                  a.download = resource.pdfFileName || "";
                                  a.click();
                                }}
                                title="Telecharger le PDF"
                                data-testid={`button-download-pdf-${resource.id}`}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setExpanded(isExpanded ? null : resource.id)}
                            data-testid={`button-expand-${resource.id}`}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">
                          {resource.category}
                        </Badge>
                        {resource.sector && (
                          <span className="text-[10px] text-muted-foreground">{resource.sector}</span>
                        )}
                        {resource.edition && (
                          <span className="text-[10px] text-muted-foreground">Edition {resource.edition}</span>
                        )}
                        {pdf && (
                          <Badge variant="secondary" className="text-[9px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            PDF disponible
                          </Badge>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
                          {resource.summary && (
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {searchKeywords.length > 0 ? highlightText(resource.summary, searchKeywords) : resource.summary}
                            </p>
                          )}

                          <div className="flex gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingResource(resource)}
                              data-testid={`button-edit-detail-${resource.id}`}
                            >
                              <Pencil className="w-3 h-3 mr-1" />
                              Modifier cette fiche
                            </Button>
                            {pdf && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(pdf, "_blank")}
                                  data-testid={`button-open-pdf-${resource.id}`}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Consulter le PDF
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const a = document.createElement("a");
                                    a.href = pdf;
                                    a.download = resource.pdfFileName || "";
                                    a.click();
                                  }}
                                  data-testid={`button-dl-pdf-${resource.id}`}
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  Telecharger
                                </Button>
                              </>
                            )}
                          </div>

                          {resource.keyStats && (resource.keyStats as string[]).length > 0 && (
                            <div>
                              <p className="text-xs font-medium flex items-center gap-1 mb-1.5">
                                <BookOpen className="w-3 h-3 text-[#1e4a8a]" />
                                Chiffres cles
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {(resource.keyStats as string[]).map((stat: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-[10px]">
                                    {searchKeywords.length > 0 ? highlightText(stat, searchKeywords) : stat}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {resource.mainRisks && (resource.mainRisks as string[]).length > 0 && (
                            <div>
                              <p className="text-xs font-medium flex items-center gap-1 mb-1.5">
                                <AlertTriangle className="w-3 h-3 text-destructive" />
                                Risques principaux
                              </p>
                              <ul className="space-y-1">
                                {(resource.mainRisks as string[]).map((risk: string, i: number) => (
                                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                    <span className="text-destructive mt-0.5">•</span>
                                    {searchKeywords.length > 0 ? highlightText(risk, searchKeywords) : risk}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {resource.preventionActions && (resource.preventionActions as string[]).length > 0 && (
                            <div>
                              <p className="text-xs font-medium flex items-center gap-1 mb-1.5">
                                <Lightbulb className="w-3 h-3 text-green-600" />
                                Actions de prevention
                              </p>
                              <ul className="space-y-1">
                                {(resource.preventionActions as string[]).map((action: string, i: number) => (
                                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                    <span className="text-green-600 mt-0.5">•</span>
                                    {searchKeywords.length > 0 ? highlightText(action, searchKeywords) : action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {resource.supportActors && (resource.supportActors as string[]).length > 0 && (
                            <div>
                              <p className="text-xs font-medium flex items-center gap-1 mb-1.5">
                                <Users className="w-3 h-3 text-[#1e4a8a]" />
                                Acteurs de soutien
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {(resource.supportActors as string[]).map((actor: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-[10px]">{actor}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {resource.employeeSteps && (resource.employeeSteps as string[]).length > 0 && (
                            <div>
                              <p className="text-xs font-medium flex items-center gap-1 mb-1.5">
                                <Shield className="w-3 h-3 text-amber-600" />
                                Etapes pour le salarie
                              </p>
                              <ul className="space-y-1">
                                {(resource.employeeSteps as string[]).map((step: string, i: number) => (
                                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                    <span className="text-amber-600 mt-0.5">{i + 1}.</span>
                                    {searchKeywords.length > 0 ? highlightText(step, searchKeywords) : step}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex items-center gap-3 pt-1">
                            {resource.inrsUrl && (
                              <a
                                href={resource.inrsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                data-testid={`link-inrs-${resource.id}`}
                              >
                                <ExternalLink className="w-3 h-3" />
                                Voir sur inrs.fr
                              </a>
                            )}
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
      )}

      {editingResource && (
        <EditResourceDialog
          resource={editingResource}
          open={!!editingResource}
          onOpenChange={(open) => { if (!open) setEditingResource(null); }}
        />
      )}
    </div>
  );
}
