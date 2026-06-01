import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Plus, Receipt, Eye } from "lucide-react";
import type { Order, Invoice } from "@shared/schema";

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function statusBadge(status: string) {
  switch (status) {
    case "draft":
      return <Badge variant="outline" className="text-orange-600 border-orange-300">Brouillon</Badge>;
    case "validated":
      return <Badge className="bg-green-600 text-white">Valide</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function invoiceStatusBadge(status: string) {
  switch (status) {
    case "emise":
      return <Badge variant="outline" className="text-blue-600 border-blue-300">Emise</Badge>;
    case "payee":
      return <Badge className="bg-green-600 text-white">Payee</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function Orders() {
  const { data: orderList, isLoading: loadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });
  const { data: invoiceList, isLoading: loadingInvoices } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-6 h-6 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight" data-testid="text-orders-title">
              Bons de commande & Factures
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Gestion des bons de commande et facturation des prestations DUERP.
          </p>
        </div>
        <Link href="/orders/new">
          <Button data-testid="button-new-order">
            <Plus className="w-4 h-4 mr-1" />
            Nouveau bon de commande
          </Button>
        </Link>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Bons de commande
        </h2>
        {loadingOrders ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : !orderList || orderList.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Aucun bon de commande. Cliquez sur "Nouveau bon de commande" ou utilisez le bouton
              "Bon pour Accord" depuis la fiche d'une entreprise.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {orderList.map(order => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid={`card-order-${order.id}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm" data-testid={`text-order-number-${order.id}`}>
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.companyName} - {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{formatCents(order.totalTTC)} EUR TTC</span>
                      {statusBadge(order.status)}
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Receipt className="w-4 h-4" />
          Factures
        </h2>
        {loadingInvoices ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : !invoiceList || invoiceList.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Aucune facture. Les factures sont generees automatiquement lors de la validation d'un bon de commande.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {invoiceList.map(inv => (
              <Link key={inv.id} href={`/invoices/${inv.id}`}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid={`card-invoice-${inv.id}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-green-700 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm" data-testid={`text-invoice-number-${inv.id}`}>
                          {inv.invoiceNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {inv.companyName} - {new Date(inv.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{formatCents(inv.totalTTC)} EUR TTC</span>
                      {invoiceStatusBadge(inv.status)}
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
