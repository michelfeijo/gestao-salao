import { z } from "zod";

export const agendamentoSchema = z.object({
  idCliente: z.string().min(1, "Cliente obrigatório"),
  idProfissional: z.string().min(1, "Profissional obrigatório"),
  idServico: z.string().min(1, "Serviço obrigatório"),
  data: z.string().min(1, "Data obrigatória"),
  horaInicio: z.string().min(1, "Horário obrigatório"),
  observacoes: z.string().optional(),
});

export type AgendamentoFormData = z.infer<typeof agendamentoSchema>;

export const AGENDAMENTO_STATUS = ["agendado", "concluido", "cancelado"] as const;
export type AgendamentoStatus = (typeof AGENDAMENTO_STATUS)[number];
