import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Building2, Receipt, Users } from "lucide-react";

interface CommercialStat {
  userId: string;
  username: string;
  fullName: string;
  region: string | null;
  isActive: boolean;
  totalCompanies: number;
  totalProspects: number;
  totalClients: number;
  totalOrders: number;
  validatedOrders: number;
  totalCA: number;
  totalPaid: number;
  totalUnpaid: number;
  geoDistribution: Record<string, number>;
}

interface AdminStats {
  summary: any;
  commercials: CommercialStat[];
}

export default function AdminResults() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const formatEuros = (cents: number) => (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          {[1,2,3].map(i => <div key={i} className="h-48 bg-muted rounded-lg" />)}
        </div>
      </div>
    );
  }

  const commercials = (stats?.commercials || []).sort((a, b) => b.totalCA - a.totalCA);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-admin-results-title">Resultats par commercial</h1>
        <p className="text-muted-foreground text-sm mt-1">Detail des performances de chaque commercial</p>
      </div>

      {commercials.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun commercial enregistre</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {commercials.map((com, index) => (
            <Card key={com.userId} data-testid={`card-result-${com.userId}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${com.isActive ? 'bg-blue-600' : 'bg-gray-400'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle className="text-base">{com.fullName}</CardTitle>
                      <p className="text-xs text-muted-foreground">@{com.username} {com.region && `- ${com.region}`}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">{formatEuros(com.totalCA)}</div>
                    <p className="text-xs text-muted-foreground">CA total TTC</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{com.totalCompanies}</div>
                    <div className="text-[11px] text-muted-foreground">Entreprises</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{com.totalProspects}</div>
                    <div className="text-[11px] text-muted-foreground">Prospects</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{com.totalClients}</div>
                    <div className="text-[11px] text-muted-foreground">Clients</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{com.totalOrders}</div>
                    <div className="text-[11px] text-muted-foreground">BC emis</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{com.validatedOrders}</div>
                    <div className="text-[11px] text-muted-foreground">BC valides</div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">Encaisse :</span>
                    <span className="font-medium">{formatEuros(com.totalPaid)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingDown className="w-4 h-4 text-orange-500" />
                    <span className="text-muted-foreground">En attente :</span>
                    <span className="font-medium">{formatEuros(com.totalUnpaid)}</span>
                  </div>
                </div>

                {Object.keys(com.geoDistribution).length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Repartition geographique des ventes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(com.geoDistribution)
                        .sort((a, b) => b[1] - a[1])
                        .map(([city, count]) => (
                        <Badge key={city} variant="secondary" className="text-[10px]">
                          {city} ({count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
