import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft, Edit, Trash2, Plus, ClipboardCheck, Building2,
  MapPin, Phone, Mail, Users, FileText, ArrowRight, Receipt,
} from "lucide-react";
import type { Company, Assessment, IndustrySector } from "@shared/schema";

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: company, isLoading } = useQuery<Company>({
    queryKey: ["/api/companies", id],
  });

  const { data: assessments } = useQuery<Assessment[]>({
    queryKey: ["/api/companies", id, "assessments"],
  });

  const { data: sectors } = useQuery<IndustrySector[]>({
    queryKey: ["/api/sectors"],
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/companies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({ title: "Entreprise supprimee" });
      navigate("/companies");
    },
  });

  const sector = sectors?.find((s) => s.id === company?.industrySectorId);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Entreprise non trouvee</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/companies")} data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold" data-testid="text-company-name">{company.name}</h1>
            {sector && (
              <Badge variant="secondary" className="mt-1 text-xs" data-testid="badge-sector">
                {sector.name}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/companies/${id}/edit`}>
            <Button variant="outline" size="sm" data-testid="button-edit">
              <Edit className="w-3.5 h-3.5 mr-1" /> Modifier
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("Supprimer cette entreprise ?")) deleteMutation.mutate();
            }}
            data-testid="button-delete"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Coordonnees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {company.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span>{company.address}{company.postalCode ? `, ${company.postalCode}` : ""} {company.city}</span>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{company.phone}</span>
              </div>
            )}
            {company.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{company.email}</span>
              </div>
            )}
            {company.siret && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="font-mono text-xs">SIRET: {company.siret}</span>
              </div>
            )}
            {company.employeeCount !== null && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{company.employeeCount} salarie(s)</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {company.contactName && <p><span className="text-muted-foreground">Nom:</span> {company.contactName}</p>}
            {company.contactRole && <p><span className="text-muted-foreground">Fonction:</span> {company.contactRole}</p>}
            {company.notes && (
              <div className="pt-2 border-t">
                <p className="text-muted-foreground text-xs mb-1">Notes:</p>
                <p className="text-xs whitespace-pre-wrap">{company.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Bon pour Accord - DUERP</p>
            <p className="text-xs text-muted-foreground">
              Generer un bon de commande pre-rempli avec les informations de cette entreprise
            </p>
          </div>
          <Link href={`/orders/new/${id}`}>
            <Button data-testid="button-bon-pour-accord">
              <Receipt className="w-4 h-4 mr-1" />
              Bon pour Accord
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold">Evaluations des risques</CardTitle>
          <Link href={`/assessments/new/${id}`}>
            <Button size="sm" data-testid="button-new-assessment">
              <Plus className="w-3.5 h-3.5 mr-1" /> Nouvelle evaluation
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {assessments && assessments.length > 0 ? (
            <div className="divide-y">
              {assessments.map((a) => (
                <Link key={a.id} href={`/assessments/${a.id}`}>
                  <div className="flex items-center gap-3 p-3 cursor-pointer hover-elevate" data-testid={`card-assessment-${a.id}`}>
                    <div className="w-8 h-8 rounded-md bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                      <ClipboardCheck className="w-4 h-4 text-chart-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.assessorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <Badge variant={a.status === "completed" ? "default" : "secondary"}>
                      {a.status === "completed" ? "Termine" : "En cours"}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <ClipboardCheck className="w-10 h-10 mx-auto text-muted-foreground/20 mb-2" />
              <p className="text-sm text-muted-foreground">Aucune evaluation</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
