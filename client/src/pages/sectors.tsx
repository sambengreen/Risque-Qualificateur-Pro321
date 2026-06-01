import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Search, Factory, ArrowRight, ClipboardList } from "lucide-react";
import type { IndustrySector } from "@shared/schema";

export default function Sectors() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const { data: sectors, isLoading } = useQuery<IndustrySector[]>({
    queryKey: ["/api/sectors"],
  });

  const categories = useMemo(() => {
    if (!sectors) return [];
    const cats = [...new Set(sectors.map((s) => s.category).filter(Boolean))];
    return cats.sort();
  }, [sectors]);

  const filtered = sectors?.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = !categoryFilter || s.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight" data-testid="text-sectors-title">
          Secteurs OiRA
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {sectors?.length || 0} questionnaires sectoriels INRS/OiRA
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un secteur..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-sectors"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge
            variant={categoryFilter === null ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => setCategoryFilter(null)}
            data-testid="filter-all"
          >
            Tous
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={categoryFilter === cat ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat!)}
              data-testid={`filter-${cat}`}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered?.map((sector) => (
            <Link key={sector.id} href={`/sectors/${sector.id}`}>
              <Card className="cursor-pointer hover-elevate h-full" data-testid={`card-sector-${sector.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Factory className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate" data-testid={`text-sector-name-${sector.id}`}>
                        {sector.name}
                      </h3>
                      {sector.category && (
                        <Badge variant="secondary" className="text-[10px] mt-1">{sector.category}</Badge>
                      )}
                      {sector.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {sector.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0 mt-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
