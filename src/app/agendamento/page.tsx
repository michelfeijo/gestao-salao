import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toAgendamento, toServico } from "@/lib/types";
import { AgendamentoView } from "@/components/agendamento/agendamento-view";
import { hojeISO, inicioDoDia, fimDoDia } from "@/lib/utils/data-hora";

interface AgendamentoPageProps {
  searchParams: Promise<{ data?: string }>;
}

export default async function AgendamentoPage({ searchParams }: AgendamentoPageProps) {
  const session = await auth();
  if (!session) redirect("/entrar");

  const { data: dataParam } = await searchParams;
  const data = dataParam || hojeISO();
  const idSalao = session.user.idSalao;

  const [profissionaisRows, servicosRows, clientesRows, agendamentosRows] = await Promise.all([
    prisma.profissional.findMany({
      where: { idSalao, ativo: true },
      orderBy: { nome: "asc" },
    }),
    prisma.servico.findMany({
      where: { idSalao, ativo: true },
      include: { categoria: true },
      orderBy: { nome: "asc" },
    }),
    prisma.cliente.findMany({
      where: { idSalao },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
    prisma.agendamento.findMany({
      where: {
        idSalao,
        inicio: { gte: inicioDoDia(data), lt: fimDoDia(data) },
      },
      include: {
        cliente: { select: { nome: true } },
        profissional: { select: { nome: true, cor: true } },
        servico: { select: { nome: true, duracaoMinutos: true } },
      },
      orderBy: { inicio: "asc" },
    }),
  ]);

  const profissionais = profissionaisRows.map((p) => ({ id: p.id, nome: p.nome, cor: p.cor }));
  const servicos = servicosRows.map(toServico);
  const clientes = clientesRows;
  const agendamentos = agendamentosRows.map(toAgendamento);

  return (
    <AgendamentoView
      data={data}
      profissionais={profissionais}
      servicos={servicos}
      clientes={clientes}
      agendamentos={agendamentos}
    />
  );
}
