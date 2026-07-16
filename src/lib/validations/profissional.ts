import { z } from "zod";

export const CARGOS = [
  "Cabeleireiro(a)",
  "Barbeiro(a)",
  "Manicure/Pedicure",
  "Esteticista",
  "Maquiador(a)",
  "Depilador(a)",
  "Recepcionista",
  "Outro",
] as const;

export const profissionalSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  telefone: z.string().min(14, "Telefone inválido"),
  email: z.string().optional(),
  cpf: z.string().optional(),
  cargo: z.string().min(1, "Função obrigatória"),
  especialidades: z.string().optional(),
  cor: z.string().min(1, "Cor obrigatória"),
  dataInicio: z.string().optional(),
  observacoes: z.string().optional(),
  ativo: z.boolean(),
});

export type ProfissionalFormData = z.infer<typeof profissionalSchema>;
