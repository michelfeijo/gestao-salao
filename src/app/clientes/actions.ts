"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { clienteSchema } from "@/lib/validations/cliente";

export async function criarCliente(data: unknown) {
  const session = await auth();
  if (!session) {
    return { error: "Não autorizado." };
  }

  const parsed = clienteSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  const { dataNascimento, ...rest } = parsed.data;

  try {
    await prisma.cliente.create({
      data: {
        ...rest,
        idSalao: session.user.idSalao,
        dataNascimento: new Date(dataNascimento),
      },
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { error: "Já existe um cliente cadastrado com este CPF." };
    }
    throw error;
  }

  revalidatePath("/clientes");
  return { success: true };
}

export async function atualizarCliente(id: string, data: unknown) {
  const session = await auth();
  if (!session) {
    return { error: "Não autorizado." };
  }

  const parsed = clienteSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  const { dataNascimento, ...rest } = parsed.data;

  try {
    const result = await prisma.cliente.updateMany({
      where: { id, idSalao: session.user.idSalao },
      data: {
        ...rest,
        dataNascimento: new Date(dataNascimento),
      },
    });

    if (result.count === 0) {
      return { error: "Cliente não encontrado." };
    }
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { error: "Já existe um cliente cadastrado com este CPF." };
    }
    throw error;
  }

  revalidatePath("/clientes");
  return { success: true };
}
