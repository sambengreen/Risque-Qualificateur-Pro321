import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Receipt, TrendingUp, UserCheck, FileText } from "lucide-react";

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
  commercials: any[];
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const formatEuros = (cents: number) => (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-muted rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  const s = stats?.summary;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-admin-dashboard-title">Tableau de bord administrateur</h1>
        <p className="text-muted-foreground text-sm mt-1">Vue d'ensemble de l'activite commerciale Satis Conseils</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Commerciaux actifs</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-active-commercials">{s?.activeCommercials || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">sur {s?.totalCommercials || 0} au total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Entreprises</CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-total-companies">{s?.totalCompanies || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{s?.totalProspects || 0} prospects / {s?.totalClients || 0} clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bons de commande</CardTitle>
            <Receipt className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-total-orders">{s?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{s?.validatedOrders || 0} valides</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CA total TTC</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="stat-total-ca">
              {formatEuros(s?.totalCA || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Commandes validees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prospects</CardTitle>
            <UserCheck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-total-prospects">{s?.totalProspects || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">En cours de prospection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clients</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400" data-testid="stat-total-clients">{s?.totalClients || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Commandes signees</p>
          </CardContent>
        </Card>
      </div>

      {stats?.commercials && stats.commercials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Classement des commerciaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Commercial</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Region</th>
                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">Prospects</th>
                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">Clients</th>
                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">BC valides</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">CA TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.commercials
                    .sort((a, b) => b.totalCA - a.totalCA)
                    .map((com) => (
                    <tr key={com.userId} className="border-b last:border-0" data-testid={`row-commercial-${com.userId}`}>
                      <td className="py-2 px-3">
                        <div className="font-medium">{com.fullName}</div>
                        <div className="text-xs text-muted-foreground">{com.username}</div>
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">{com.region || "-"}</td>
                      <td className="text-center py-2 px-3">{com.totalProspects}</td>
                      <td className="text-center py-2 px-3">{com.totalClients}</td>
                      <td className="text-center py-2 px-3">{com.validatedOrders}</td>
                      <td className="text-right py-2 px-3 font-medium">{formatEuros(com.totalCA)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
