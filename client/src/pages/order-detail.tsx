import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Building2, CheckCircle, Edit, Trash2, Printer, Receipt, PenLine, Stamp, Mail, Send, Loader2 } from "lucide-react";
import type { Order, OrderItem } from "@shared/schema";
import { SATIS_CONSEILS } from "@shared/schema";
import CGV from "@/components/cgv";

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [stampNote, setStampNote] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailTo, setEmailTo] = useState("");

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ["/api/orders", id],
  });

  const validateMutation = useMutation({
    mutationFn: async () => {
      let signatureData = order?.signatureData || undefined;
      if (canvasRef.current && hasSignature) {
        signatureData = canvasRef.current.toDataURL("image/png");
      }
      const res = await apiRequest("POST", `/api/orders/${id}/validate`, { signatureData, stampNote });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Bon de commande valide",
        description: `Facture ${data.invoice.invoiceNumber} generee automatiquement`,
      });
    },
    onError: (err: Error) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Bon de commande supprime" });
      navigate("/orders");
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", `/api/orders/${id}/send-email`, { email });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Email envoye", description: data.message });
      setShowEmailForm(false);
      setEmailTo("");
    },
    onError: (err: Error) => {
      toast({ title: "Erreur d'envoi", description: err.message, variant: "destructive" });
    },
  });

  function startDrawing(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
    setHasSignature(true);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e293b";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }

  function stopDrawing() {
    setIsDrawing(false);
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }

  function handlePrint() {
    window.print();
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-muted-foreground">Bon de commande non trouve.</p>
      </div>
    );
  }

  const orderItems = order.items as OrderItem[];
  const isValidated = order.status === "validated";

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto text-black dark:text-foreground">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold" data-testid="text-order-detail-title">
            {order.orderNumber}
          </h1>
          {isValidated ? (
            <Badge className="bg-green-600 text-white">Valide</Badge>
          ) : (
            <Badge variant="outline" className="text-orange-600 border-orange-300">Brouillon</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setEmailTo(order.companyEmail || ""); setShowEmailForm(!showEmailForm); }} data-testid="button-toggle-email">
            <Mail className="w-4 h-4 mr-1" />
            Envoyer par email
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} data-testid="button-print-order">
            <Printer className="w-4 h-4 mr-1" />
            Imprimer
          </Button>
          {!isValidated && (
            <>
              <Link href={`/orders/${id}/edit`}>
                <Button variant="outline" size="sm" data-testid="button-edit-order">
                  <Edit className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
              </Link>
              <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate()} data-testid="button-delete-order">
                <Trash2 className="w-4 h-4 mr-1" />
                Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      {showEmailForm && (
        <Card className="print:hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-primary" />
              <p className="font-semibold text-sm">Envoyer le bon de commande par email</p>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label className="text-xs">Adresse email du destinataire</Label>
                <Input
                  type="email"
                  placeholder="client@entreprise.fr"
                  value={emailTo}
                  onChange={e => setEmailTo(e.target.value)}
                  data-testid="input-email-to"
                />
              </div>
              <Button
                onClick={() => sendEmailMutation.mutate(emailTo)}
                disabled={!emailTo || sendEmailMutation.isPending}
                data-testid="button-send-email"
              >
                {sendEmailMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-1" />
                )}
                Envoyer
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowEmailForm(false)} data-testid="button-cancel-email">
                Annuler
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Un email professionnel contenant le detail du bon de commande sera envoye a cette adresse.
            </p>
          </CardContent>
        </Card>
      )}

      <div id="order-printable" className="space-y-3 print:space-y-1.5">
        <div className="text-center py-3 print:py-1">
          <h2 className="text-lg font-bold uppercase tracking-wide print:text-base">Bon de commande</h2>
          <p className="text-sm text-neutral-600 dark:text-muted-foreground print:text-[11px]">{order.orderNumber} - {new Date(order.createdAt).toLocaleDateString("fr-FR")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2 print:grid-cols-2">
          <Card className="print:border print:shadow-none">
            <CardHeader className="pb-1 pt-3 px-4 print:pb-0.5 print:pt-2 print:px-3">
              <CardTitle className="text-xs uppercase text-neutral-500 dark:text-muted-foreground flex items-center gap-1 print:text-[9px]">
                <Building2 className="w-3.5 h-3.5 print:w-3 print:h-3" />
                Emetteur
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-normal space-y-0.5 px-4 pb-3 print:text-[10px] print:leading-snug print:px-3 print:pb-2">
              <p className="font-bold text-base print:text-[11px]">{SATIS_CONSEILS.name}</p>
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

          <Card className="print:border print:shadow-none">
            <CardHeader className="pb-1 pt-3 px-4 print:pb-0.5 print:pt-2 print:px-3">
              <CardTitle className="text-xs uppercase text-neutral-500 dark:text-muted-foreground flex items-center gap-1 print:text-[9px]">
                <Building2 className="w-3.5 h-3.5 print:w-3 print:h-3" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-normal space-y-0.5 px-4 pb-3 print:text-[10px] print:leading-snug print:px-3 print:pb-2">
              <p className="font-bold text-base print:text-[11px]" data-testid="text-client-name">{order.companyName}</p>
              {order.companyContactName && <p>A l'attention de : {order.companyContactName} {order.companyContactRole ? `(${order.companyContactRole})` : ""}</p>}
              {order.companyAddress && <p>{order.companyAddress}</p>}
              {(order.companyPostalCode || order.companyCity) && <p>{order.companyPostalCode} {order.companyCity}</p>}
              <Separator className="my-1.5" />
              {order.companySiret && <p>SIRET : {order.companySiret}</p>}
              {order.companyEmail && <p>Email : {order.companyEmail}</p>}
              {order.companyPhone && <p>Tel : {order.companyPhone}</p>}
            </CardContent>
          </Card>
        </div>

        <Card className="print:border print:shadow-none">
          <CardContent className="p-0">
            <table className="w-full text-sm print:text-[10px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 print:p-1.5 font-semibold">Description</th>
                  <th className="text-center p-3 print:p-1.5 font-semibold w-20">Qte</th>
                  <th className="text-right p-3 print:p-1.5 font-semibold w-32">Prix unit. HT</th>
                  <th className="text-right p-3 print:p-1.5 font-semibold w-32">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="p-3 print:p-1.5" data-testid={`text-item-desc-${i}`}>{item.description}</td>
                    <td className="text-center p-3 print:p-1.5">{item.quantity}</td>
                    <td className="text-right p-3 print:p-1.5">{formatCents(item.unitPriceHT)} EUR</td>
                    <td className="text-right p-3 print:p-1.5 font-semibold">{formatCents(item.totalHT)} EUR</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <div className="w-64 space-y-1 text-sm print:text-[10px]">
            <div className="flex justify-between">
              <span>Total HT</span>
              <span className="font-semibold">{formatCents(order.totalHT)} EUR</span>
            </div>
            <div className="flex justify-between text-neutral-600 dark:text-muted-foreground">
              <span>TVA ({order.tvaRate}%)</span>
              <span>{formatCents(order.totalTVA)} EUR</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold print:text-[12px]">
              <span>Total TTC</span>
              <span data-testid="text-total-ttc">{formatCents(order.totalTTC)} EUR</span>
            </div>
          </div>
        </div>

        {order.notes && (
          <Card className="print:border print:shadow-none">
            <CardContent className="p-3 print:p-2">
              <p className="text-xs font-semibold mb-0.5 print:text-[9px]">Notes / Conditions :</p>
              <p className="text-xs text-neutral-600 dark:text-muted-foreground whitespace-pre-wrap print:text-[9px]">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        <div className="border-2 border-dashed rounded-lg p-4 print:p-2">
          <div className="flex items-center gap-2 mb-2 print:mb-1">
            <PenLine className="w-4 h-4 print:w-3 print:h-3" />
            <p className="text-sm font-semibold print:text-[10px]">Signature et cachet du client</p>
          </div>
          <p className="text-xs text-neutral-600 dark:text-muted-foreground mb-3 print:text-[8px] print:mb-1">
            En signant ce bon de commande, le client accepte les prestations decrites ci-dessus
            ainsi que les Conditions Generales de Vente annexees au present document.
          </p>

          <div className="grid grid-cols-2 gap-4 print:gap-2">
            <div>
              <p className="text-[10px] text-neutral-500 dark:text-muted-foreground uppercase font-semibold mb-1 print:text-[8px]">Signature</p>
              {isValidated && order.signatureData ? (
                <div className="border rounded p-1 bg-white h-24 print:h-16 flex items-center justify-center">
                  <img src={order.signatureData} alt="Signature" className="max-h-full mx-auto" data-testid="img-signature" />
                </div>
              ) : !isValidated ? (
                <div className="space-y-1">
                  <div className="border rounded bg-white relative h-24">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={96}
                      className="w-full h-full cursor-crosshair rounded"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      data-testid="canvas-signature"
                    />
                    {!hasSignature && (
                      <p className="absolute inset-0 flex items-center justify-center text-[10px] text-neutral-400 pointer-events-none">
                        Dessinez votre signature ici
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={clearSignature} data-testid="button-clear-signature">
                    Effacer
                  </Button>
                </div>
              ) : (
                <div className="border rounded p-2 h-24 print:h-16 flex items-center justify-center bg-muted/20">
                  <p className="text-xs text-neutral-500">Signature validee</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1">
                <Stamp className="w-3 h-3 text-neutral-500 dark:text-muted-foreground" />
                <p className="text-[10px] text-neutral-500 dark:text-muted-foreground uppercase font-semibold print:text-[8px]">Cachet de la societe</p>
              </div>
              {!isValidated ? (
                <div>
                  <Input
                    value={stampNote}
                    onChange={e => setStampNote(e.target.value)}
                    placeholder="Ex: Lu et approuve, cachet appose"
                    className="text-xs h-8"
                    data-testid="input-stamp-note"
                  />
                  <div className="border rounded mt-1 h-[60px] print:h-[40px] bg-muted/5 flex items-center justify-center">
                    <p className="text-[9px] text-neutral-400">Espace cachet</p>
                  </div>
                </div>
              ) : order.stampNote ? (
                <div>
                  <p className="text-xs mb-1 print:text-[9px]" data-testid="text-stamp-note">{order.stampNote}</p>
                  <div className="border rounded h-[60px] print:h-[40px] bg-muted/5 flex items-center justify-center">
                    <p className="text-[9px] text-neutral-400">Cachet</p>
                  </div>
                </div>
              ) : (
                <div className="border rounded h-24 print:h-16 bg-muted/5 flex items-center justify-center">
                  <p className="text-[10px] text-neutral-400">Espace cachet {order.companyName}</p>
                </div>
              )}
            </div>
          </div>

          {isValidated && order.validatedAt && (
            <p className="text-xs text-green-700 dark:text-green-500 flex items-center gap-1 mt-2 print:mt-1 print:text-[9px]">
              <CheckCircle className="w-3.5 h-3.5 print:w-3 print:h-3" />
              Valide le {new Date(order.validatedAt).toLocaleDateString("fr-FR")}
            </p>
          )}
        </div>

        <div className="text-center pt-1 print:pt-0">
          <p className="text-[9px] text-neutral-500 dark:text-muted-foreground print:text-[7px]">
            {SATIS_CONSEILS.name} - {SATIS_CONSEILS.forme} - {SATIS_CONSEILS.address}, {SATIS_CONSEILS.postalCode} {SATIS_CONSEILS.city} - SIRET {SATIS_CONSEILS.siret} - TVA {SATIS_CONSEILS.tvaIntra}
          </p>
          <p className="text-[9px] text-neutral-500 dark:text-muted-foreground print:text-[7px]">
            Voir Conditions Generales de Vente en page suivante
          </p>
        </div>
      </div>

      {!isValidated && (
        <div className="flex justify-center print:hidden">
          <Button
            size="lg"
            onClick={() => validateMutation.mutate()}
            disabled={validateMutation.isPending}
            data-testid="button-validate-order"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Bon pour Accord - Valider et generer la facture
          </Button>
        </div>
      )}

      {isValidated && (
        <div className="flex justify-center print:hidden">
          <Link href="/invoices">
            <Button variant="outline" data-testid="button-view-invoices">
              <Receipt className="w-4 h-4 mr-1" />
              Voir les factures
            </Button>
          </Link>
        </div>
      )}

      <div className="mt-6 print:mt-0" style={{ pageBreakBefore: "always" }}>
        <Separator className="mb-4 print:hidden" />
        <p className="text-xs text-neutral-600 dark:text-muted-foreground text-center mb-4 print:hidden flex items-center justify-center gap-1">
          <FileText className="w-3 h-3" />
          Conditions Generales de Vente annexees au bon de commande {order.orderNumber}
        </p>
        <CGV />
      </div>
    </div>
  );
}
