"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { agendamentoSchema, type AgendamentoStatus } from "@/lib/validations/agendamento";
import { combinarDataHora } from "@/lib/utils/data-hora";

async function existeConflito(
  idSalao: string,
  idProfissional: string,
  inicio: Date,
  fim: Date,
  excluirId?: string
) {
  const conflito = await prisma.agendamento.findFirst({
    where: {
      idSalao,
      idProfissional,
      status: { not: "cancelado" },
      ...(excluirId ? { id: { not: excluirId } } : {}),
      inicio: { lt: fim },
      fim: { gt: inicio },
    },
    select: { id: true },
  });

  return Boolean(conflito);
}

export async function criarAgendamento(data: unknown) {
  const session = await auth();
  if (!session) {
    return { error: "Não autorizado." };
  }

  const parsed = agendamentoSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  const { idCliente, idProfissional, idServico, data: dataStr, horaInicio, observacoes } =
    parsed.data;
  const idSalao = session.user.idSalao;

  const [cliente, profissional, servico] = await Promise.all([
    prisma.cliente.findFirst({ where: { id: idCliente, idSalao }, select: { id: true } }),
    prisma.profissional.findFirst({
      where: { id: idProfissional, idSalao },
      select: { id: true },
    }),
    prisma.servico.findFirst({
      where: { id: idServico, idSalao },
      select: { id: true, duracaoMinutos: true },
    }),
  ]);

  if (!cliente) return { error: "Cliente não encontrado." };
  if (!profissional) return { error: "Profissional não encontrado." };
  if (!servico) return { error: "Serviço não encontrado." };

  const inicio = combinarDataHora(dataStr, horaInicio);
  const fim = new Date(inicio.getTime() + servico.duracaoMinutos * 60_000);

  if (await existeConflito(idSalao, idProfissional, inicio, fim)) {
    return { error: "Este profissional já tem um agendamento nesse horário." };
  }

  await prisma.agendamento.create({
    data: { idSalao, idCliente, idProfissional, idServico, inicio, fim, observacoes },
  });

  revalidatePath("/agendamento");
  return { success: true };
}

export async function atualizarAgendamento(id: string, data: unknown) {
  const session = await auth();
  if (!session) {
    return { error: "Não autorizado." };
  }

  const idSalao = session.user.idSalao;

  const existente = await prisma.agendamento.findFirst({
    where: { id, idSalao },
    select: { id: true },
  });
  if (!existente) {
    return { error: "Agendamento não encontrado." };
  }

  const parsed = agendamentoSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  const { idCliente, idProfissional, idServico, data: dataStr, horaInicio, observacoes } =
    parsed.data;

  const [cliente, profissional, servico] = await Promise.all([
    prisma.cliente.findFirst({ where: { id: idCliente, idSalao }, select: { id: true } }),
    prisma.profissional.findFirst({
      where: { id: idProfissional, idSalao },
      select: { id: true },
    }),
    prisma.servico.findFirst({
      where: { id: idServico, idSalao },
      select: { id: true, duracaoMinutos: true },
    }),
  ]);

  if (!cliente) return { error: "Cliente não encontrado." };
  if (!profissional) return { error: "Profissional não encontrado." };
  if (!servico) return { error: "Serviço não encontrado." };

  const inicio = combinarDataHora(dataStr, horaInicio);
  const fim = new Date(inicio.getTime() + servico.duracaoMinutos * 60_000);

  if (await existeConflito(idSalao, idProfissional, inicio, fim, id)) {
    return { error: "Este profissional já tem um agendamento nesse horário." };
  }

  await prisma.agendamento.update({
    where: { id },
    data: { idCliente, idProfissional, idServico, inicio, fim, observacoes },
  });

  revalidatePath("/agendamento");
  return { success: true };
}

export async function atualizarStatusAgendamento(id: string, status: AgendamentoStatus) {
  const session = await auth();
  if (!session) {
    return { error: "Não autorizado." };
  }

  const result = await prisma.agendamento.updateMany({
    where: { id, idSalao: session.user.idSalao },
    data: { status },
  });

  if (result.count === 0) {
    return { error: "Agendamento não encontrado." };
  }

  revalidatePath("/agendamento");
  return { success: true };
}
