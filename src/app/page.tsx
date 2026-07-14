import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Calendar, DollarSign, UserCheck, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const metrics = [
  { label: "Agendamentos hoje", icon: Calendar },
  { label: "Clientes ativos", icon: Users },
  { label: "Faturamento do mês", icon: DollarSign },
  { label: "Profissionais ativos", icon: UserCheck },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/entrar");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do salão</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, icon: Icon }) => (
          <Card key={label} className="p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-foreground/25">—</p>
          </Card>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        As informações serão exibidas assim que os dados estiverem disponíveis.
      </p>
    </div>
  );
}
