import { z } from "zod";

export const categoriaServicoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

export type CategoriaServicoFormData = z.infer<typeof categoriaServicoSchema>;
