"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.success) {
      window.location.href = "/";
    }
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
        />
      </div>

      {state?.error && (
        <p className="text-destructive text-sm text-center">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={pending || state?.success}>
        {pending || state?.success ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
