import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toProfissional } from "@/lib/types";
import { ProfissionaisView } from "@/components/profissionais/profissionais-view";

export default async function ProfissionaisPage() {
  const session = await auth();
  if (!session) redirect("/entrar");

  const rows = await prisma.profissional.findMany({ orderBy: { createdAt: "desc" } });
  const profissionais = rows.map(toProfissional);

  return <ProfissionaisView profissionais={profissionais} />;
}
