import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, UnauthorizedError } from "@/lib/queryClient";
import { ArrowLeft, Save, Search, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { Company, IndustrySector } from "@shared/schema";

const formSchema = z.object({
  name: z.string().min(1, "Le nom est obligatoire"),
  siret: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Email invalide").optional().or(z.literal("")).nullable(),
  contactName: z.string().optional().nullable(),
  contactRole: z.string().optional().nullable(),
  industrySectorId: z.string().optional().nullable(),
  employeeCount: z.coerce.number().int().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

type SiretLookupStatus = "idle" | "loading" | "success" | "error";

export default function CompanyForm() {
  const params = useParams<{ id: string }>();
  const isEdit = !!params.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [siretStatus, setSiretStatus] = useState<SiretLookupStatus>("idle");
  const [siretMessage, setSiretMessage] = useState("");

  const { data: company } = useQuery<Company>({
    queryKey: ["/api/companies", params.id],
    enabled: isEdit,
  });

  const { data: sectors } = useQuery<IndustrySector[]>({
    queryKey: ["/api/sectors"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    values: isEdit && company ? {
      name: company.name,
      siret: company.siret || "",
      address: company.address || "",
      city: company.city || "",
      postalCode: company.postalCode || "",
      phone: company.phone || "",
      email: company.email || "",
      contactName: company.contactName || "",
      contactRole: company.contactRole || "",
      industrySectorId: company.industrySectorId || "",
      employeeCount: company.employeeCount || 0,
      notes: company.notes || "",
    } : {
      name: "",
      siret: "",
      address: "",
      city: "",
      postalCode: "",
      phone: "",
      email: "",
      contactName: "",
      contactRole: "",
      industrySectorId: "",
      employeeCount: 0,
      notes: "",
    },
  });

  const lookupSiret = useCallback(async () => {
    const siret = (form.getValues("siret") || "").replace(/\s/g, "");
    if (!siret || siret.length !== 14 || !/^\d{14}$/.test(siret)) {
      setSiretStatus("error");
      setSiretMessage("Le SIRET doit contenir exactement 14 chiffres");
      return;
    }

    setSiretStatus("loading");
    setSiretMessage("Recherche en cours...");

    try {
      const response = await fetch(`/api/siret-lookup/${siret}`);
      if (!response.ok) {
        const err = await response.json();
        setSiretStatus("error");
        setSiretMessage(err.message || "Entreprise non trouvee");
        return;
      }

      const data = await response.json();
      form.setValue("name", data.name, { shouldDirty: true });
      form.setValue("address", data.address, { shouldDirty: true });
      form.setValue("city", data.city, { shouldDirty: true });
      form.setValue("postalCode", data.postalCode, { shouldDirty: true });
      if (data.employeeCount > 0) {
        form.setValue("employeeCount", data.employeeCount, { shouldDirty: true });
      }

      setSiretStatus("success");
      setSiretMessage(`${data.name} - ${data.city}`);

      toast({
        title: "Entreprise trouvee",
        description: `${data.name} (${data.city})`,
      });
    } catch {
      setSiretStatus("error");
      setSiretMessage("Impossible de contacter le service de recherche");
    }
  }, [form, toast]);

  const handleSiretKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      lookupSiret();
    }
  }, [lookupSiret]);

  const handleSiretChange = useCallback((value: string) => {
    const cleaned = value.replace(/[^\d\s]/g, "");
    form.setValue("siret", cleaned);
    if (siretStatus !== "idle") {
      setSiretStatus("idle");
      setSiretMessage("");
    }

    const digits = cleaned.replace(/\s/g, "");
    if (digits.length === 14) {
      setSiretStatus("loading");
      setSiretMessage("Recherche en cours...");
      setTimeout(async () => {
        try {
          const response = await fetch(`/api/siret-lookup/${digits}`);
          if (!response.ok) {
            const err = await response.json();
            setSiretStatus("error");
            setSiretMessage(err.message || "Entreprise non trouvee");
            return;
          }
          const data = await response.json();
          form.setValue("name", data.name, { shouldDirty: true });
          form.setValue("address", data.address, { shouldDirty: true });
          form.setValue("city", data.city, { shouldDirty: true });
          form.setValue("postalCode", data.postalCode, { shouldDirty: true });
          if (data.employeeCount > 0) {
            form.setValue("employeeCount", data.employeeCount, { shouldDirty: true });
          }
          setSiretStatus("success");
          setSiretMessage(`${data.name} - ${data.city}`);
          toast({
            title: "Entreprise trouvee",
            description: `${data.name} (${data.city})`,
          });
        } catch {
          setSiretStatus("error");
          setSiretMessage("Impossible de contacter le service de recherche");
        }
      }, 300);
    }
  }, [form, toast, siretStatus]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const cleaned = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === "" ? null : v])
      );
      if (isEdit) {
        return apiRequest("PATCH", `/api/companies/${params.id}`, cleaned);
      }
      return apiRequest("POST", "/api/companies", cleaned);
    },
    onSuccess: async (res) => {
      const result = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({ title: isEdit ? "Entreprise modifiee" : "Entreprise creee" });
      navigate(`/companies/${result.id}`);
    },
    onError: (error) => {
      if (error instanceof UnauthorizedError) {
        toast({ title: "Session expiree", description: "Veuillez vous reconnecter", variant: "destructive" });
      } else {
        toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
      }
    },
  });

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()} data-testid="button-back">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold" data-testid="text-form-title">
          {isEdit ? "Modifier l'entreprise" : "Nouvelle entreprise"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          {!isEdit && (
            <Card className="border-[#1e4a8a]/20 bg-[#1e4a8a]/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[#1e4a8a]">
                  <Search className="w-4 h-4" />
                  Recherche automatique par SIRET
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Saisissez le numero SIRET (14 chiffres) pour remplir automatiquement les informations de l'entreprise.
                </p>
                <div className="flex gap-2">
                  <FormField control={form.control} name="siret" render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Ex: 77567145600082"
                          value={field.value || ""}
                          onChange={(e) => handleSiretChange(e.target.value)}
                          onKeyDown={handleSiretKeyDown}
                          maxLength={17}
                          data-testid="input-siret-lookup"
                        />
                      </FormControl>
                    </FormItem>
                  )} />
                  <Button
                    type="button"
                    onClick={lookupSiret}
                    disabled={siretStatus === "loading"}
                    className="bg-[#1e4a8a] hover:bg-[#1e4a8a]/90"
                    data-testid="button-siret-lookup"
                  >
                    {siretStatus === "loading" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span className="ml-1.5 hidden sm:inline">Rechercher</span>
                  </Button>
                </div>
                {siretMessage && (
                  <div
                    className={`flex items-center gap-2 text-xs py-1.5 px-2 rounded ${
                      siretStatus === "success"
                        ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                        : siretStatus === "error"
                        ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    }`}
                    data-testid="text-siret-status"
                  >
                    {siretStatus === "success" && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
                    {siretStatus === "error" && <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                    {siretStatus === "loading" && <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />}
                    {siretMessage}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Informations generales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'entreprise *</FormLabel>
                    <FormControl><Input {...field} data-testid="input-company-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {isEdit && (
                  <FormField control={form.control} name="siret" render={({ field }) => (
                    <FormItem>
                      <FormLabel>SIRET</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} data-testid="input-siret" /></FormControl>
                    </FormItem>
                  )} />
                )}
              </div>
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} data-testid="input-address" /></FormControl>
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="postalCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code postal</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} data-testid="input-postal" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} data-testid="input-city" /></FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telephone</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} data-testid="input-phone" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" {...field} value={field.value || ""} data-testid="input-email" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Secteur et effectif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <FormField control={form.control} name="industrySectorId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Secteur d'activite (OiRA)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger data-testid="select-sector">
                        <SelectValue placeholder="Selectionner un secteur" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-80">
                      {sectors?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="employeeCount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de salaries</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} value={field.value || ""} data-testid="input-employees" />
                  </FormControl>
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField control={form.control} name="contactName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du contact</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} data-testid="input-contact-name" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="contactRole" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fonction</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} data-testid="input-contact-role" /></FormControl>
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} rows={3} data-testid="textarea-notes" />
                  </FormControl>
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => window.history.back()} data-testid="button-cancel">
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending} data-testid="button-save">
              <Save className="w-4 h-4 mr-1.5" />
              {mutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
