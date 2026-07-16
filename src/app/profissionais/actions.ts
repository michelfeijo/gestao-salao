"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profissionalSchema } from "@/lib/validations/profissional";

export async function criarProfissional(data: unknown) {
  const session = await auth();
  if (!session) {
    return { error: "Não autorizado." };
  }

  const parsed = profissionalSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  const { dataInicio, cpf, ...rest } = parsed.data;

  try {
    await prisma.profissional.create({
      data: {
        ...rest,
        cpf: cpf ? cpf : undefined,
        dataInicio: dataInicio ? new Date(dataInicio) : undefined,
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

  const { dataInicio, cpf, ...rest } = parsed.data;

  try {
    await prisma.profissional.update({
      where: { id },
      data: {
        ...rest,
        cpf: cpf ? cpf : null,
        dataInicio: dataInicio ? new Date(dataInicio) : null,
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
