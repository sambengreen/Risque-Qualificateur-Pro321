import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Building2, Plus, Search, MapPin, Users, ArrowRight } from "lucide-react";
import { useState } from "react";
import type { Company } from "@shared/schema";

export default function Companies() {
  const [search, setSearch] = useState("");
  const { data: companies, isLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const normalizeSearch = (s: string) => s.replace(/\s/g, "").toLowerCase();
  const searchNorm = normalizeSearch(search);

  const filtered = companies?.filter((c) => {
    const nameMatch = c.name.toLowerCase().includes(search.toLowerCase());
    const cityMatch = c.city && c.city.toLowerCase().includes(search.toLowerCase());
    const siretNorm = c.siret ? c.siret.replace(/\s/g, "") : "";
    const siretMatch = siretNorm.includes(searchNorm);
    const emailMatch = c.email && c.email.toLowerCase().includes(search.toLowerCase());
    const contactMatch = c.contactName && c.contactName.toLowerCase().includes(search.toLowerCase());
    return nameMatch || cityMatch || siretMatch || emailMatch || contactMatch;
  });

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight" data-testid="text-companies-title">
            Entreprises
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {companies?.length || 0} entreprise(s) enregistree(s)
          </p>
        </div>
        <Link href="/companies/new">
          <Button data-testid="button-new-company">
            <Plus className="w-4 h-4 mr-1.5" />
            Nouvelle entreprise
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, ville ou SIRET..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="input-search-companies"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((company) => (
            <Link key={company.id} href={`/companies/${company.id}`}>
              <Card className="cursor-pointer hover-elevate h-full" data-testid={`card-company-${company.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate" data-testid={`text-company-name-${company.id}`}>
                        {company.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        {company.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {company.city}
                          </span>
                        )}
                        {company.employeeCount && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {company.employeeCount} salaries
                          </span>
                        )}
                      </div>
                      {company.siret && (
                        <p className="text-[11px] text-muted-foreground/60 mt-1 font-mono">
                          SIRET: {company.siret}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-muted-foreground text-sm">
              {search ? "Aucune entreprise trouvee pour cette recherche" : "Aucune entreprise enregistree"}
            </p>
            {!search && (
              <Link href="/companies/new">
                <Button variant="outline" className="mt-4" data-testid="button-add-first-company">
                  Ajouter une entreprise
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
