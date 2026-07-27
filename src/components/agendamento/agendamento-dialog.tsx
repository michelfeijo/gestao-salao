"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  agendamentoSchema,
  type AgendamentoFormData,
} from "@/lib/validations/agendamento";
import {
  criarAgendamento,
  atualizarAgendamento,
  atualizarStatusAgendamento,
} from "@/app/agendamento/actions";
import { dataISO, formatarHora } from "@/lib/utils/data-hora";
import type { Agendamento, Servico } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ClienteResumo {
  id: string;
  nome: string;
}

interface ProfissionalResumo {
  id: string;
  nome: string;
  cor: string;
}

interface Prefill {
  idProfissional?: string;
  data?: string;
  horaInicio?: string;
}

interface AgendamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientes: ClienteResumo[];
  profissionais: ProfissionalResumo[];
  servicos: Servico[];
  agendamento?: Agendamento;
  prefill?: Prefill;
}

function valoresIniciais(
  agendamento: Agendamento | undefined,
  prefill: Prefill | undefined
): AgendamentoFormData {
  if (agendamento) {
    return {
      idCliente: agendamento.idCliente,
      idProfissional: agendamento.idProfissional,
      idServico: agendamento.idServico,
      data: dataISO(agendamento.inicio),
      horaInicio: formatarHora(agendamento.inicio),
      observacoes: agendamento.observacoes ?? "",
    };
  }

  return {
    idCliente: "",
    idProfissional: prefill?.idProfissional ?? "",
    idServico: "",
    data: prefill?.data ?? "",
    horaInicio: prefill?.horaInicio ?? "",
    observacoes: "",
  };
}

const STATUS_LABEL: Record<string, string> = {
  agendado: "Agendado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export function AgendamentoDialog({
  open,
  onOpenChange,
  clientes,
  profissionais,
  servicos,
  agendamento,
  prefill,
}: AgendamentoDialogProps) {
  const [erroSubmit, setErroSubmit] = useState<string | null>(null);
  const editando = Boolean(agendamento);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AgendamentoFormData>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: valoresIniciais(agendamento, prefill),
  });

  useEffect(() => {
    if (open) reset(valoresIniciais(agendamento, prefill));
  }, [open, agendamento, prefill, reset]);

  async function onSubmit(data: AgendamentoFormData) {
    setErroSubmit(null);
    const result = agendamento
      ? await atualizarAgendamento(agendamento.id, data)
      : await criarAgendamento(data);

    if (result?.error) {
      setErroSubmit(result.error);
      return;
    }

    onOpenChange(false);
  }

  async function mudarStatus(status: "concluido" | "cancelado") {
    if (!agendamento) return;
    setErroSubmit(null);
    const result = await atualizarStatusAgendamento(agendamento.id, status);
    if (result?.error) {
      setErroSubmit(result.error);
      return;
    }
    onOpenChange(false);
  }

  function handleClose() {
    setErroSubmit(null);
    onOpenChange(false);
  }

  const inputClass = "h-9 text-sm";
  const labelClass = "text-xs font-medium text-muted-foreground";
  const errorClass = "text-xs text-destructive mt-0.5";

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editando ? "Editar Agendamento" : "Novo Agendamento"}
            {agendamento && (
              <Badge variant={agendamento.status === "cancelado" ? "secondary" : "default"}>
                {STATUS_LABEL[agendamento.status]}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="idCliente" className={labelClass}>
                Cliente <span className="text-destructive">*</span>
              </Label>
              <select
                id="idCliente"
                {...register("idCliente")}
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Selecione...</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
              {errors.idCliente && (
                <p className={errorClass}>{errors.idCliente.message}</p>
              )}
            </div>

            <div className="col-span-2 space-y-1">
              <Label htmlFor="idServico" className={labelClass}>
                Serviço <span className="text-destructive">*</span>
              </Label>
              <select
                id="idServico"
                {...register("idServico")}
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Selecione...</option>
                {servicos.map((servico) => (
                  <option key={servico.id} value={servico.id}>
                    {servico.nome} ({servico.duracaoMinutos} min)
                  </option>
                ))}
              </select>
              {errors.idServico && (
                <p className={errorClass}>{errors.idServico.message}</p>
              )}
            </div>

            <div className="col-span-2 space-y-1">
              <Label htmlFor="idProfissional" className={labelClass}>
                Profissional <span className="text-destructive">*</span>
              </Label>
              <select
                id="idProfissional"
                {...register("idProfissional")}
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Selecione...</option>
                {profissionais.map((profissional) => (
                  <option key={profissional.id} value={profissional.id}>
                    {profissional.nome}
                  </option>
                ))}
              </select>
              {errors.idProfissional && (
                <p className={errorClass}>{errors.idProfissional.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="data" className={labelClass}>
                Data <span className="text-destructive">*</span>
              </Label>
              <Input
                id="data"
                type="date"
                className={inputClass}
                {...register("data")}
              />
              {errors.data && <p className={errorClass}>{errors.data.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="horaInicio" className={labelClass}>
                Horário <span className="text-destructive">*</span>
              </Label>
              <Input
                id="horaInicio"
                type="time"
                className={inputClass}
                {...register("horaInicio")}
              />
              {errors.horaInicio && (
                <p className={errorClass}>{errors.horaInicio.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label className={labelClass}>
              Observações{" "}
              <span className="font-normal normal-case tracking-normal">
                (opcional)
              </span>
            </Label>
            <Textarea
              placeholder="Informações adicionais sobre o agendamento..."
              className="resize-none text-sm"
              rows={2}
              {...register("observacoes")}
            />
          </div>

          {erroSubmit && (
            <p className="text-sm text-destructive text-center">{erroSubmit}</p>
          )}

          <DialogFooter className="flex-wrap gap-2">
            {editando && agendamento?.status === "agendado" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => mudarStatus("cancelado")}
                  disabled={isSubmitting}
                >
                  Cancelar agendamento
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => mudarStatus("concluido")}
                  disabled={isSubmitting}
                >
                  Marcar concluído
                </Button>
              </>
            )}
            <div className="flex-1" />
            <Button type="button" variant="outline" onClick={handleClose}>
              Fechar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : editando
                  ? "Salvar alterações"
                  : "Salvar agendamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
