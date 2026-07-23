"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profissionalSchema } from "@/lib/validations/profissional";

async function servicoIdsValidos(idSalao: string, servicoIds: string[] | undefined) {
  if (!servicoIds || servicoIds.length === 0) return [];

  const servicos = await prisma.servico.findMany({
    where: { id: { in: servicoIds }, idSalao },
    select: { id: true },
  });

  return servicos.map((s) => s.id);
}

export async function criarProfissional(data: unknown) {
  const session = await auth();
  if (!session) {
    return { error: "Não autorizado." };
  }

  const parsed = profissionalSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  const { dataInicio, cpf, servicoIds, ...rest } = parsed.data;
  const idsValidos = await servicoIdsValidos(session.user.idSalao, servicoIds);

  try {
    await prisma.profissional.create({
      data: {
        ...rest,
        idSalao: session.user.idSalao,
        cpf: cpf ? cpf : undefined,
        dataInicio: dataInicio ? new Date(dataInicio) : undefined,
        servicos: { connect: idsValidos.map((id) => ({ id })) },
      },
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { error: "Já existe um profissional cadastrado com este CPF." };
    }
    throw error;
  }

  revalidatePath("/profissionais");
  return { success: true };
}

export async function atualizarProfissional(id: string, data: unknown) {
  const session = await auth();
  if (!session) {
    return { error: "Não autorizado." };
  }

  const parsed = profissionalSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  const existente = await prisma.profissional.findFirst({
    where: { id, idSalao: session.user.idSalao },
    select: { id: true },
  });

  if (!existente) {
    return { error: "Profissional não encontrado." };
  }

  const { dataInicio, cpf, servicoIds, ...rest } = parsed.data;
  const idsValidos = await servicoIdsValidos(session.user.idSalao, servicoIds);

  try {
    await prisma.profissional.update({
      where: { id },
      data: {
        ...rest,
        cpf: cpf ? cpf : null,
        dataInicio: dataInicio ? new Date(dataInicio) : null,
        servicos: { set: idsValidos.map((id) => ({ id })) },
      },
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { error: "Já existe um profissional cadastrado com este CPF." };
    }
    throw error;
  }

  revalidatePath("/profissionais");
  return { success: true };
}
