import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, UserCheck, UserX, KeyRound } from "lucide-react";

interface UserData {
  id: string;
  username: string;
  fullName: string;
  role: string;
  email: string | null;
  phone: string | null;
  region: string | null;
  isActive: boolean;
  createdAt: string;
}

const REGIONS = [
  "Ile-de-France", "Auvergne-Rhone-Alpes", "Nouvelle-Aquitaine", "Occitanie",
  "Hauts-de-France", "Provence-Alpes-Cote d'Azur", "Grand Est", "Pays de la Loire",
  "Bretagne", "Normandie", "Bourgogne-Franche-Comte", "Centre-Val de Loire",
  "Corse", "DOM-TOM",
];

export default function AdminUsers() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [resetPwUser, setResetPwUser] = useState<UserData | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [formData, setFormData] = useState({
    username: "", password: "", fullName: "", role: "commercial" as string,
    email: "", phone: "", region: "", isActive: true,
  });

  const { data: usersList = [], isLoading } = useQuery<UserData[]>({ queryKey: ["/api/admin/users"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowForm(false);
      resetForm();
      toast({ title: "Commercial cree avec succes" });
    },
    onError: (err: Error) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("PATCH", `/api/admin/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditUser(null);
      resetForm();
      toast({ title: "Utilisateur mis a jour" });
    },
    onError: (err: Error) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Utilisateur supprime" });
    },
    onError: (err: Error) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const resetPwMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => apiRequest("PATCH", `/api/admin/users/${id}`, { password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setResetPwUser(null);
      setNewPassword("");
      toast({ title: "Mot de passe modifie" });
    },
  });

  const resetForm = () => {
    setFormData({ username: "", password: "", fullName: "", role: "commercial", email: "", phone: "", region: "", isActive: true });
  };

  const openEdit = (u: UserData) => {
    setEditUser(u);
    setFormData({
      username: u.username, password: "", fullName: u.fullName, role: u.role,
      email: u.email || "", phone: u.phone || "", region: u.region || "", isActive: u.isActive,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editUser) {
      const { password, ...data } = formData;
      updateMutation.mutate({ id: editUser.id, data });
    } else {
      createMutation.mutate(formData);
    }
  };

  const commercials = usersList.filter(u => u.role === "commercial");
  const admins = usersList.filter(u => u.role === "admin");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-admin-users-title">Gestion des commerciaux</h1>
          <p className="text-muted-foreground text-sm mt-1">{commercials.length} commerciaux / {admins.length} administrateurs</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); setEditUser(null); }} data-testid="button-add-user">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau commercial
        </Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-lg" />)}
        </div>
      ) : (
        <div className="grid gap-3">
          {usersList.map(u => (
            <Card key={u.id} data-testid={`card-user-${u.id}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${u.isActive ? 'bg-green-600' : 'bg-gray-400'}`}>
                  {u.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{u.fullName}</span>
                    <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-[10px]">
                      {u.role === "admin" ? "Admin" : "Commercial"}
                    </Badge>
                    {!u.isActive && (
                      <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-300">
                        Inactif
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
                    <span>@{u.username}</span>
                    {u.email && <span>{u.email}</span>}
                    {u.phone && <span>{u.phone}</span>}
                    {u.region && <span>{u.region}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => updateMutation.mutate({ id: u.id, data: { isActive: !u.isActive } })} title={u.isActive ? "Desactiver" : "Activer"} data-testid={`button-toggle-active-${u.id}`}>
                    {u.isActive ? <UserCheck className="w-4 h-4 text-green-600" /> : <UserX className="w-4 h-4 text-gray-400" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setResetPwUser(u)} title="Changer mot de passe" data-testid={`button-reset-pw-${u.id}`}>
                    <KeyRound className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(u)} title="Modifier" data-testid={`button-edit-user-${u.id}`}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  {u.role !== "admin" && (
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Supprimer cet utilisateur ?")) deleteMutation.mutate(u.id); }} title="Supprimer" data-testid={`button-delete-user-${u.id}`}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm || !!editUser} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditUser(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editUser ? "Modifier l'utilisateur" : "Nouveau commercial"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Identifiant</Label>
                <Input value={formData.username} onChange={e => setFormData(d => ({ ...d, username: e.target.value }))} required disabled={!!editUser} data-testid="input-user-username" />
              </div>
              {!editUser && (
                <div className="space-y-2">
                  <Label>Mot de passe</Label>
                  <Input type="password" value={formData.password} onChange={e => setFormData(d => ({ ...d, password: e.target.value }))} required data-testid="input-user-password" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input value={formData.fullName} onChange={e => setFormData(d => ({ ...d, fullName: e.target.value }))} required data-testid="input-user-fullname" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData(d => ({ ...d, email: e.target.value }))} data-testid="input-user-email" />
              </div>
              <div className="space-y-2">
                <Label>Telephone</Label>
                <Input value={formData.phone} onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))} data-testid="input-user-phone" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={v => setFormData(d => ({ ...d, role: v }))}>
                  <SelectTrigger data-testid="select-user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Region</Label>
                <Select value={formData.region || "none"} onValueChange={v => setFormData(d => ({ ...d, region: v === "none" ? "" : v }))}>
                  <SelectTrigger data-testid="select-user-region">
                    <SelectValue placeholder="Selectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Non renseignee</SelectItem>
                    {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditUser(null); }}>Annuler</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-user">
                {editUser ? "Enregistrer" : "Creer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetPwUser} onOpenChange={(open) => { if (!open) { setResetPwUser(null); setNewPassword(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Nouveau mot de passe pour <strong>{resetPwUser?.fullName}</strong></p>
          <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe" data-testid="input-new-password" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPwUser(null)}>Annuler</Button>
            <Button onClick={() => resetPwUser && resetPwMutation.mutate({ id: resetPwUser.id, password: newPassword })} disabled={!newPassword || newPassword.length < 4} data-testid="button-confirm-reset-pw">
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
