import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toProfissional, toServico } from "@/lib/types";
import { ProfissionaisView } from "@/components/profissionais/profissionais-view";

export default async function ProfissionaisPage() {
  const session = await auth();
  if (!session) redirect("/entrar");

  const [rows, servicosRows] = await Promise.all([
    prisma.profissional.findMany({
      where: { idSalao: session.user.idSalao },
      include: { servicos: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.servico.findMany({
      where: { idSalao: session.user.idSalao, ativo: true },
      include: { categoria: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  const profissionais = rows.map(toProfissional);
  const servicos = servicosRows.map(toServico);

  return <ProfissionaisView profissionais={profissionais} servicos={servicos} />;
}
