import { z } from "zod";
import { validarCPF } from "@/lib/utils/cpf";

export const clienteSchema = z.object({
  cpf: z.string().min(1, "CPF obrigatório").refine(validarCPF, "CPF inválido"),
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  telefone: z.string().min(14, "Telefone inválido"),
  dataNascimento: z.string().min(1, "Data de nascimento obrigatória"),
  genero: z.string().min(1, "Gênero obrigatório"),
  email: z.string().optional(),
  cep: z.string().optional(),
  rua: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  observacoes: z.string().optional(),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;
