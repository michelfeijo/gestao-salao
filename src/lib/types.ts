import type { Cliente as ClienteDb } from "@/generated/prisma/client";

export interface Cliente {
  cpf: string;
  nome: string;
  telefone: string;
  dataNascimento: string;
  genero: "masculino" | "feminino" | "nao-binario" | "prefiro-nao-informar";
  email?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  observacoes?: string;
}

export function toCliente(row: ClienteDb): Cliente {
  return {
    cpf: row.cpf,
    nome: row.nome,
    telefone: row.telefone,
    dataNascimento: row.dataNascimento.toISOString().slice(0, 10),
    genero: row.genero as Cliente["genero"],
    email: row.email ?? undefined,
    cep: row.cep ?? undefined,
    rua: row.rua ?? undefined,
    numero: row.numero ?? undefined,
    complemento: row.complemento ?? undefined,
    bairro: row.bairro ?? undefined,
    cidade: row.cidade ?? undefined,
    estado: row.estado ?? undefined,
    observacoes: row.observacoes ?? undefined,
  };
}
