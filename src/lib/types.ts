import type {
  Cliente as ClienteDb,
  Profissional as ProfissionalDb,
  CategoriaServico as CategoriaServicoDb,
  Servico as ServicoDb,
} from "@/generated/prisma/client";

export interface Cliente {
  id: string;
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
    id: row.id,
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
  servicoIds: string[];
}

export function toProfissional(
  row: ProfissionalDb & { servicos?: { id: string }[] }
): Profissional {
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
    servicoIds: row.servicos?.map((s) => s.id) ?? [],
  };
}

export interface CategoriaServico {
  id: string;
  nome: string;
}

export function toCategoriaServico(row: CategoriaServicoDb): CategoriaServico {
  return {
    id: row.id,
    nome: row.nome,
  };
}

export interface Servico {
  id: string;
  nome: string;
  idCategoria: string;
  categoriaNome?: string;
  duracaoMinutos: number;
  preco: number;
  ativo: boolean;
  observacoes?: string;
}

export function toServico(
  row: ServicoDb & { categoria?: CategoriaServicoDb }
): Servico {
  return {
    id: row.id,
    nome: row.nome,
    idCategoria: row.idCategoria,
    categoriaNome: row.categoria?.nome,
    duracaoMinutos: row.duracaoMinutos,
    preco: Number(row.preco),
    ativo: row.ativo,
    observacoes: row.observacoes ?? undefined,
  };
}
