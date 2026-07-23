import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toCategoriaServico, toServico } from "@/lib/types";
import { ServicosView } from "@/components/servicos/servicos-view";

export default async function ServicosPage() {
  const session = await auth();
  if (!session) redirect("/entrar");

  const [categoriasRows, servicosRows] = await Promise.all([
    prisma.categoriaServico.findMany({
      where: { idSalao: session.user.idSalao },
      orderBy: { nome: "asc" },
    }),
    prisma.servico.findMany({
      where: { idSalao: session.user.idSalao },
      include: { categoria: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const categorias = categoriasRows.map(toCategoriaServico);
  const servicos = servicosRows.map(toServico);

  return <ServicosView servicos={servicos} categorias={categorias} />;
}
