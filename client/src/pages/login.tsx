import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shield, LogIn, AlertCircle } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[hsl(0,72%,42%)] flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-login-title">
            Satis Consulting
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            DUERP & Prevention des risques professionnels
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Identifiant</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Votre identifiant"
                required
                autoFocus
                data-testid="input-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
                data-testid="input-password"
              />
            </div>

            {login.isError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg" data-testid="text-login-error">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{(login.error as Error)?.message?.includes("401") ? "Identifiant ou mot de passe incorrect" : "Erreur de connexion"}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={login.isPending || !username || !password}
              data-testid="button-login"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {login.isPending ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-[10px] text-muted-foreground">
              Conforme INRS ED 840 / OiRA - 46 questionnaires sectoriels
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
