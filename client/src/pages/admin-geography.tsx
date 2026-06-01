import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

interface AdminStats {
  summary: {
    totalCommercials: number;
    activeCommercials: number;
    totalCompanies: number;
    totalProspects: number;
    totalClients: number;
    totalOrders: number;
    validatedOrders: number;
    totalCA: number;
    geoDistribution: Record<string, number>;
  };
  commercials: {
    userId: string;
    fullName: string;
    region: string | null;
    validatedOrders: number;
    totalCA: number;
    geoDistribution: Record<string, number>;
  }[];
}

export default function AdminGeography() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const formatEuros = (cents: number) => (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  const geo = stats?.summary?.geoDistribution || {};
  const sortedCities = Object.entries(geo).sort((a, b) => b[1] - a[1]);
  const totalSales = sortedCities.reduce((s, [, c]) => s + c, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-admin-geo-title">Repartition geographique</h1>
        <p className="text-muted-foreground text-sm mt-1">Localisation des ventes par ville et par commercial</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Ventes par ville
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedCities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune vente enregistree</p>
          ) : (
            <div className="space-y-3">
              {sortedCities.map(([city, count]) => {
                const pct = totalSales > 0 ? Math.round((count / totalSales) * 100) : 0;
                return (
                  <div key={city} className="flex items-center gap-3" data-testid={`geo-city-${city}`}>
                    <div className="w-32 text-sm font-medium truncate">{city}</div>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all"
                        style={{ width: `${Math.max(pct, 3)}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-sm font-medium">{count} vente{count > 1 ? "s" : ""}</div>
                    <div className="w-12 text-right text-xs text-muted-foreground">{pct}%</div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {stats?.commercials && stats.commercials.filter(c => Object.keys(c.geoDistribution).length > 0).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detail par commercial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {stats.commercials
                .filter(c => Object.keys(c.geoDistribution).length > 0)
                .sort((a, b) => b.totalCA - a.totalCA)
                .map(com => (
                <div key={com.userId} className="border rounded-lg p-4" data-testid={`geo-commercial-${com.userId}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium text-sm">{com.fullName}</div>
                      <div className="text-xs text-muted-foreground">{com.region || "Region non renseignee"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600 dark:text-green-400">{formatEuros(com.totalCA)}</div>
                      <div className="text-xs text-muted-foreground">{com.validatedOrders} vente{com.validatedOrders > 1 ? "s" : ""}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(com.geoDistribution)
                      .sort((a, b) => b[1] - a[1])
                      .map(([city, count]) => (
                      <Badge key={city} variant="outline" className="text-[10px]">
                        <MapPin className="w-3 h-3 mr-1" />
                        {city} ({count})
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
