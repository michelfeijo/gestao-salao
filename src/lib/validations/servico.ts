import { z } from "zod";

export const servicoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  idCategoria: z.string().min(1, "Categoria obrigatória"),
  duracaoMinutos: z
    .number()
    .int("Duração deve ser um número inteiro")
    .min(1, "Duração deve ser maior que zero"),
  preco: z.number().min(0, "Preço inválido"),
  ativo: z.boolean(),
  observacoes: z.string().optional(),
});

export type ServicoFormData = z.infer<typeof servicoSchema>;
