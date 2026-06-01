import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Receipt, Building2, Printer, CheckCircle } from "lucide-react";
import type { Invoice, OrderItem } from "@shared/schema";
import { SATIS_CONSEILS } from "@shared/schema";

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: invoice, isLoading } = useQuery<Invoice>({
    queryKey: ["/api/invoices", id],
  });

  const markPaidMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/invoices/${id}`, {
        status: "payee",
        paidAt: new Date().toISOString(),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices", id] });
      toast({ title: "Facture marquee comme payee" });
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-muted-foreground">Facture non trouvee.</p>
      </div>
    );
  }

  const invoiceItems = invoice.items as OrderItem[];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <Receipt className="w-6 h-6 text-green-700" />
          <h1 className="text-xl font-bold" data-testid="text-invoice-detail-title">
            {invoice.invoiceNumber}
          </h1>
          {invoice.status === "payee" ? (
            <Badge className="bg-green-600 text-white">Payee</Badge>
          ) : (
            <Badge variant="outline" className="text-blue-600 border-blue-300">Emise</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} data-testid="button-print-invoice">
            <Printer className="w-4 h-4 mr-1" />
            Imprimer
          </Button>
          {invoice.status !== "payee" && (
            <Button
              size="sm"
              onClick={() => markPaidMutation.mutate()}
              disabled={markPaidMutation.isPending}
              data-testid="button-mark-paid"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Marquer comme payee
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4 print:space-y-3">
        <div className="text-center py-4 print:py-2 border-b-2 border-primary">
          <h2 className="text-2xl font-bold uppercase tracking-wide text-primary">FACTURE</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {invoice.invoiceNumber} - Date : {new Date(invoice.createdAt).toLocaleDateString("fr-FR")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase text-muted-foreground flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                Emetteur
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-0.5">
              <p className="font-bold text-sm">{SATIS_CONSEILS.name}</p>
              <p>{SATIS_CONSEILS.forme}</p>
              <p>{SATIS_CONSEILS.address}</p>
              <p>{SATIS_CONSEILS.postalCode} {SATIS_CONSEILS.city}</p>
              <Separator className="my-1.5" />
              <p>SIRET : {SATIS_CONSEILS.siret}</p>
              <p>SIREN : {SATIS_CONSEILS.siren}</p>
              <p>TVA Intra. : {SATIS_CONSEILS.tvaIntra}</p>
              <p>{SATIS_CONSEILS.rcs} - NAF : {SATIS_CONSEILS.naf}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase text-muted-foreground flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-0.5">
              <p className="font-bold text-sm" data-testid="text-invoice-client">{invoice.companyName}</p>
              {invoice.companyContactName && <p>A l'attention de : {invoice.companyContactName}</p>}
              {invoice.companyAddress && <p>{invoice.companyAddress}</p>}
              {(invoice.companyPostalCode || invoice.companyCity) && <p>{invoice.companyPostalCode} {invoice.companyCity}</p>}
              <Separator className="my-1.5" />
              {invoice.companySiret && <p>SIRET : {invoice.companySiret}</p>}
              {invoice.companyEmail && <p>Email : {invoice.companyEmail}</p>}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Description</th>
                  <th className="text-center p-3 font-semibold w-20">Qte</th>
                  <th className="text-right p-3 font-semibold w-32">Prix unit. HT</th>
                  <th className="text-right p-3 font-semibold w-32">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.map((item, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="p-3">{item.description}</td>
                    <td className="text-center p-3">{item.quantity}</td>
                    <td className="text-right p-3">{formatCents(item.unitPriceHT)} EUR</td>
                    <td className="text-right p-3 font-semibold">{formatCents(item.totalHT)} EUR</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total HT</span>
              <span className="font-semibold">{formatCents(invoice.totalHT)} EUR</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>TVA ({invoice.tvaRate}%)</span>
              <span>{formatCents(invoice.totalTVA)} EUR</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Total TTC</span>
              <span data-testid="text-invoice-total">{formatCents(invoice.totalTTC)} EUR</span>
            </div>
          </div>
        </div>

        {invoice.status === "payee" && invoice.paidAt && (
          <div className="text-center py-3">
            <Badge className="bg-green-600 text-white text-sm px-4 py-1">
              <CheckCircle className="w-4 h-4 mr-1" />
              Payee le {new Date(invoice.paidAt).toLocaleDateString("fr-FR")}
            </Badge>
          </div>
        )}

        <Card className="bg-muted/30">
          <CardContent className="p-3 text-[10px] text-muted-foreground space-y-0.5">
            <p className="font-semibold text-xs">Mentions legales</p>
            <p>{SATIS_CONSEILS.name} - {SATIS_CONSEILS.forme}</p>
            <p>{SATIS_CONSEILS.address}, {SATIS_CONSEILS.postalCode} {SATIS_CONSEILS.city}</p>
            <p>SIRET : {SATIS_CONSEILS.siret} - TVA Intracommunautaire : {SATIS_CONSEILS.tvaIntra}</p>
            <p>{SATIS_CONSEILS.rcs} - Code NAF : {SATIS_CONSEILS.naf} ({SATIS_CONSEILS.nafLabel})</p>
            <p className="pt-1">En cas de retard de paiement, une penalite de 3 fois le taux d'interet legal sera appliquee, ainsi qu'une indemnite forfaitaire de 40 EUR pour frais de recouvrement (art. L.441-10 du Code de commerce).</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
