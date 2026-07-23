"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { categoriaServicoSchema } from "@/lib/validations/categoria-servico";
import { servicoSchema } from "@/lib/validations/servico";

export async function criarCategoria(data: unknown) {
  const session = await auth();
  if (!session) {
    return { error: "Não autorizado." };
  }

  const parsed = categoriaServicoSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  try {
    await prisma.categoriaServico.create({
      data: {
        ...parsed.data,
        idSalao: session.user.idSalao,
      },
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { error: "Já existe uma categoria com esse nome." };
    }
    throw error;
  }

  revalidatePath("/servicos");
  return { success: true };
}

export async function atualizarCategoria(id: string, data: unknown) {
  const session = await auth();
  if (!session) {
    return { error: "Não autorizado." };
  }

  const parsed = categoriaServicoSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  try {
    const result = await prisma.categoriaServico.updateMany({
      where: { id, idSalao: session.user.idSalao },
      data: parsed.data,
    });

    if (result.count === 0) {
      return { error: "Categoria não encontrada." };
    }
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { error: "Já existe uma categoria com esse nome." };
    }
    throw error;
  }

  revalidatePath("/servicos");
  return { success: true };
}

export async function criarServico(data: unknown) {
  const session = await auth();
  if (!session) {
    return { error: "Não autorizado." };
  }

  const parsed = servicoSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  try {
    await prisma.servico.create({
      data: {
        ...parsed.data,
        idSalao: session.user.idSalao,
      },
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { error: "Já existe um serviço com esse nome." };
    }
    throw error;
  }

  revalidatePath("/servicos");
  return { success: true };
}

export async function atualizarServico(id: string, data: unknown) {
  const session = await auth();
  if (!session) {
    return { error: "Não autorizado." };
  }

  const parsed = servicoSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  try {
    const result = await prisma.servico.updateMany({
      where: { id, idSalao: session.user.idSalao },
      data: parsed.data,
    });

    if (result.count === 0) {
      return { error: "Serviço não encontrado." };
    }
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { error: "Já existe um serviço com esse nome." };
    }
    throw error;
  }

  revalidatePath("/servicos");
  return { success: true };
}
