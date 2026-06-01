import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, UnauthorizedError } from "@/lib/queryClient";
import { FileText, Building2, Plus, Trash2, Save, Search, X } from "lucide-react";
import type { Company, Order, OrderItem } from "@shared/schema";
import { SATIS_CONSEILS, PRESTATIONS } from "@shared/schema";

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export default function OrderForm() {
  const params = useParams<{ id?: string; companyId?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEdit = !!params.id;

  const { data: companies, isLoading: loadingCompanies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: existingOrder, isLoading: loadingOrder } = useQuery<Order>({
    queryKey: ["/api/orders", params.id],
    enabled: isEdit,
  });

  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [companyName, setCompanyName] = useState("");
  const [companySiret, setCompanySiret] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyCity, setCompanyCity] = useState("");
  const [companyPostalCode, setCompanyPostalCode] = useState("");
  const [companyContactName, setCompanyContactName] = useState("");
  const [companyContactRole, setCompanyContactRole] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [items, setItems] = useState<OrderItem[]>([
    { description: PRESTATIONS[0].description, quantity: 1, unitPriceHT: PRESTATIONS[0].unitPriceHT, totalHT: PRESTATIONS[0].unitPriceHT },
  ]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (existingOrder && isEdit) {
      setSelectedCompanyId(existingOrder.companyId);
      setCompanyName(existingOrder.companyName);
      setCompanySiret(existingOrder.companySiret || "");
      setCompanyAddress(existingOrder.companyAddress || "");
      setCompanyCity(existingOrder.companyCity || "");
      setCompanyPostalCode(existingOrder.companyPostalCode || "");
      setCompanyContactName(existingOrder.companyContactName || "");
      setCompanyContactRole(existingOrder.companyContactRole || "");
      setCompanyEmail(existingOrder.companyEmail || "");
      setCompanyPhone(existingOrder.companyPhone || "");
      setItems(existingOrder.items as OrderItem[]);
      setNotes(existingOrder.notes || "");
    }
  }, [existingOrder, isEdit]);

  useEffect(() => {
    if (params.companyId && companies) {
      const company = companies.find(c => c.id === params.companyId);
      if (company) {
        fillCompanyFields(company);
      }
    }
  }, [params.companyId, companies]);

  function fillCompanyFields(company: Company) {
    setSelectedCompanyId(company.id);
    setCompanyName(company.name);
    setCompanySiret(company.siret || "");
    setCompanyAddress(company.address || "");
    setCompanyCity(company.city || "");
    setCompanyPostalCode(company.postalCode || "");
    setCompanyContactName(company.contactName || "");
    setCompanyContactRole(company.contactRole || "");
    setCompanyEmail(company.email || "");
    setCompanyPhone(company.phone || "");
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowCompanyDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizeStr = (s: string) => s.replace(/\s/g, "").toLowerCase();
  const searchNorm = normalizeStr(companySearch);
  const filteredCompanies = companies?.filter((c) => {
    if (!companySearch.trim()) return true;
    const nameMatch = c.name.toLowerCase().includes(companySearch.toLowerCase());
    const siretNorm = c.siret ? c.siret.replace(/\s/g, "") : "";
    const siretMatch = siretNorm.includes(searchNorm);
    const cityMatch = c.city ? c.city.toLowerCase().includes(companySearch.toLowerCase()) : false;
    const emailMatch = c.email ? c.email.toLowerCase().includes(companySearch.toLowerCase()) : false;
    const contactMatch = c.contactName ? c.contactName.toLowerCase().includes(companySearch.toLowerCase()) : false;
    return nameMatch || siretMatch || cityMatch || emailMatch || contactMatch;
  }) || [];

  function handleCompanySelect(company: Company) {
    fillCompanyFields(company);
    setCompanySearch("");
    setShowCompanyDropdown(false);
  }

  function clearCompanySelection() {
    setSelectedCompanyId("");
    setCompanyName("");
    setCompanySiret("");
    setCompanyAddress("");
    setCompanyCity("");
    setCompanyPostalCode("");
    setCompanyContactName("");
    setCompanyContactRole("");
    setCompanyEmail("");
    setCompanyPhone("");
    setCompanySearch("");
  }

  function addPrestation(code: string) {
    const prestation = PRESTATIONS.find(p => p.code === code);
    if (prestation) {
      setItems(prev => [
        ...prev,
        { description: prestation.description, quantity: 1, unitPriceHT: prestation.unitPriceHT, totalHT: prestation.unitPriceHT },
      ]);
    }
  }

  function removeItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof OrderItem, value: string | number) {
    setItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index] };
      if (field === "quantity") {
        item.quantity = Number(value) || 1;
      } else if (field === "unitPriceHT") {
        item.unitPriceHT = Math.round(Number(value) * 100) || 0;
      } else if (field === "description") {
        item.description = String(value);
      }
      item.totalHT = item.quantity * item.unitPriceHT;
      updated[index] = item;
      return updated;
    });
  }

  const totalHT = items.reduce((sum, item) => sum + item.totalHT, 0);
  const tvaRate = 20;
  const totalTVA = Math.round(totalHT * tvaRate / 100);
  const totalTTC = totalHT + totalTVA;

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/orders", data);
      return res.json();
    },
    onSuccess: (order: Order) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Bon de commande cree", description: order.orderNumber });
      navigate(`/orders/${order.id}`);
    },
    onError: (err: Error) => {
      if (err instanceof UnauthorizedError) {
        toast({ title: "Session expiree", description: "Veuillez vous reconnecter", variant: "destructive" });
      } else {
        toast({ title: "Erreur", description: err.message, variant: "destructive" });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", `/api/orders/${params.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders", params.id] });
      toast({ title: "Bon de commande mis a jour" });
      navigate(`/orders/${params.id}`);
    },
    onError: (err: Error) => {
      if (err instanceof UnauthorizedError) {
        toast({ title: "Session expiree", description: "Veuillez vous reconnecter", variant: "destructive" });
      } else {
        toast({ title: "Erreur", description: err.message, variant: "destructive" });
      }
    },
  });

  function handleSubmit() {
    if (!selectedCompanyId || !companyName) {
      toast({ title: "Erreur", description: "Veuillez selectionner une entreprise", variant: "destructive" });
      return;
    }
    if (items.length === 0) {
      toast({ title: "Erreur", description: "Ajoutez au moins une prestation", variant: "destructive" });
      return;
    }
    const data = {
      companyId: selectedCompanyId,
      companyName,
      companySiret,
      companyAddress,
      companyCity,
      companyPostalCode,
      companyContactName,
      companyContactRole,
      companyEmail,
      companyPhone,
      items,
      totalHT,
      tvaRate,
      totalTVA,
      totalTTC,
      status: "draft",
      notes,
    };
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }

  if ((isEdit && loadingOrder) || loadingCompanies) {
    return (
      <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <FileText className="w-6 h-6 text-primary" />
        <h1 className="text-xl md:text-2xl font-bold tracking-tight" data-testid="text-order-form-title">
          {isEdit ? "Modifier le bon de commande" : "Nouveau bon de commande"}
        </h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Emetteur - {SATIS_CONSEILS.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-0.5">
          <p>{SATIS_CONSEILS.forme}</p>
          <p>{SATIS_CONSEILS.address}, {SATIS_CONSEILS.postalCode} {SATIS_CONSEILS.city}</p>
          <p>SIRET : {SATIS_CONSEILS.siret} - SIREN : {SATIS_CONSEILS.siren}</p>
          <p>TVA Intracommunautaire : {SATIS_CONSEILS.tvaIntra}</p>
          <p>{SATIS_CONSEILS.rcs} - NAF : {SATIS_CONSEILS.naf}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Client (destinataire)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEdit && (
            <div ref={searchRef} className="relative">
              <Label className="text-xs">Rechercher une entreprise (nom, SIRET, ville, contact...)</Label>
              {selectedCompanyId ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 border rounded-md px-3 py-2 bg-muted/30 text-sm flex items-center gap-2" data-testid="selected-company-display">
                    <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-medium">{companyName}</span>
                    {companySiret && <span className="text-muted-foreground text-xs">({companySiret})</span>}
                    {companyCity && <span className="text-muted-foreground text-xs">- {companyCity}</span>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearCompanySelection} data-testid="button-clear-company">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Tapez un nom, SIRET, ville ou contact..."
                    className="pl-9"
                    value={companySearch}
                    onChange={e => {
                      setCompanySearch(e.target.value);
                      setShowCompanyDropdown(true);
                    }}
                    onFocus={() => setShowCompanyDropdown(true)}
                    data-testid="input-search-company-order"
                  />
                </div>
              )}
              {showCompanyDropdown && !selectedCompanyId && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-64 overflow-y-auto" data-testid="company-search-dropdown">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-accent transition-colors border-b last:border-b-0 flex items-start gap-2"
                        onClick={() => handleCompanySelect(c)}
                        data-testid={`company-option-${c.id}`}
                      >
                        <Building2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{c.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.siret && <span>SIRET: {c.siret}</span>}
                            {c.city && <span> - {c.city}</span>}
                            {c.contactName && <span> - {c.contactName}</span>}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                      Aucune entreprise trouvee
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Raison sociale</Label>
              <Input value={companyName} onChange={e => setCompanyName(e.target.value)} data-testid="input-company-name" />
            </div>
            <div>
              <Label className="text-xs">SIRET</Label>
              <Input value={companySiret} onChange={e => setCompanySiret(e.target.value)} data-testid="input-company-siret" />
            </div>
            <div>
              <Label className="text-xs">Adresse</Label>
              <Input value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} data-testid="input-company-address" />
            </div>
            <div>
              <Label className="text-xs">Code postal</Label>
              <Input value={companyPostalCode} onChange={e => setCompanyPostalCode(e.target.value)} data-testid="input-company-postal" />
            </div>
            <div>
              <Label className="text-xs">Ville</Label>
              <Input value={companyCity} onChange={e => setCompanyCity(e.target.value)} data-testid="input-company-city" />
            </div>
            <div>
              <Label className="text-xs">Contact</Label>
              <Input value={companyContactName} onChange={e => setCompanyContactName(e.target.value)} data-testid="input-contact-name" />
            </div>
            <div>
              <Label className="text-xs">Fonction</Label>
              <Input value={companyContactRole} onChange={e => setCompanyContactRole(e.target.value)} data-testid="input-contact-role" />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} data-testid="input-company-email" />
            </div>
            <div>
              <Label className="text-xs">Telephone</Label>
              <Input value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} data-testid="input-company-phone" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Prestations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESTATIONS.map(p => (
              <Button
                key={p.code}
                variant="outline"
                size="sm"
                onClick={() => addPrestation(p.code)}
                data-testid={`button-add-prestation-${p.code}`}
              >
                <Plus className="w-3 h-3 mr-1" />
                {p.code === "DUERP_CREATION" ? "DUERP Etablissement" : "DUERP Mise a jour"}
              </Button>
            ))}
          </div>

          {items.map((item, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-2" data-testid={`order-item-${index}`}>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={item.description}
                    onChange={e => updateItem(index, "description", e.target.value)}
                    data-testid={`input-item-desc-${index}`}
                  />
                </div>
                <Button variant="ghost" size="sm" className="mt-5 text-red-500" onClick={() => removeItem(index)} data-testid={`button-remove-item-${index}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Quantite</Label>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => updateItem(index, "quantity", e.target.value)}
                    data-testid={`input-item-qty-${index}`}
                  />
                </div>
                <div>
                  <Label className="text-xs">Prix unitaire HT (EUR)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(item.unitPriceHT / 100).toFixed(2)}
                    onChange={e => updateItem(index, "unitPriceHT", e.target.value)}
                    data-testid={`input-item-price-${index}`}
                  />
                </div>
                <div>
                  <Label className="text-xs">Total HT</Label>
                  <Input value={formatCents(item.totalHT) + " EUR"} readOnly className="bg-muted" />
                </div>
              </div>
            </div>
          ))}

          <div className="border-t pt-3 space-y-1 text-right">
            <p className="text-sm">Total HT : <span className="font-semibold">{formatCents(totalHT)} EUR</span></p>
            <p className="text-sm">TVA ({tvaRate}%) : <span className="font-semibold">{formatCents(totalTVA)} EUR</span></p>
            <p className="text-base font-bold">Total TTC : {formatCents(totalTTC)} EUR</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Notes / Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Conditions de paiement, remarques..."
            rows={3}
            data-testid="input-order-notes"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/orders")} data-testid="button-cancel-order">
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={createMutation.isPending || updateMutation.isPending}
          data-testid="button-save-order"
        >
          <Save className="w-4 h-4 mr-1" />
          {isEdit ? "Enregistrer les modifications" : "Creer le bon de commande"}
        </Button>
      </div>
    </div>
  );
}
