import type {
  Cliente as ClienteDb,
  Profissional as ProfissionalDb,
} from "@/generated/prisma/client";

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

export interface Profissional {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  cpf?: string;
  cargo: string;
  especialidades?: string;
  cor: string;
  dataInicio?: string;
  ativo: boolean;
  observacoes?: string;
}

export function toProfissional(row: ProfissionalDb): Profissional {
  return {
    id: row.id,
    nome: row.nome,
    telefone: row.telefone,
    email: row.email ?? undefined,
    cpf: row.cpf ?? undefined,
    cargo: row.cargo,
    especialidades: row.especialidades ?? undefined,
    cor: row.cor,
    dataInicio: row.dataInicio?.toISOString().slice(0, 10),
    ativo: row.ativo,
    observacoes: row.observacoes ?? undefined,
  };
}
