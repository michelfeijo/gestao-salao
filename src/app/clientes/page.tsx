import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toCliente } from "@/lib/types";
import { ClientesView } from "@/components/clientes/clientes-view";

export default async function ClientesPage() {
  const session = await auth();
  if (!session) redirect("/entrar");

  const rows = await prisma.cliente.findMany({ orderBy: { createdAt: "desc" } });
  const clientes = rows.map(toCliente);

  return <ClientesView clientes={clientes} />;
}
