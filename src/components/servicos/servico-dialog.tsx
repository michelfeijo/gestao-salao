"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { servicoSchema, type ServicoFormData } from "@/lib/validations/servico";
import { criarServico, atualizarServico } from "@/app/servicos/actions";
import type { CategoriaServico, Servico } from "@/lib/types";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface ServicoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categorias: CategoriaServico[];
  servico?: Servico;
}

function valoresIniciais(servico?: Servico): ServicoFormData {
  if (!servico) {
    return {
      nome: "",
      idCategoria: "",
      duracaoMinutos: 30,
      preco: 0,
      ativo: true,
      observacoes: "",
    };
  }

  return {
    nome: servico.nome,
    idCategoria: servico.idCategoria,
    duracaoMinutos: servico.duracaoMinutos,
    preco: servico.preco,
    ativo: servico.ativo,
    observacoes: servico.observacoes ?? "",
  };
}

export function ServicoDialog({
  open,
  onOpenChange,
  categorias,
  servico,
}: ServicoDialogProps) {
  const [erroSubmit, setErroSubmit] = useState<string | null>(null);
  const editando = Boolean(servico);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServicoFormData>({
    resolver: zodResolver(servicoSchema),
    defaultValues: valoresIniciais(servico),
  });

  useEffect(() => {
    if (open) reset(valoresIniciais(servico));
  }, [open, servico, reset]);

  async function onSubmit(data: ServicoFormData) {
    setErroSubmit(null);
    const result = servico
      ? await atualizarServico(servico.id, data)
      : await criarServico(data);

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
          <DialogTitle>{editando ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {editando && (
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-xs text-muted-foreground">
                  Serviços inativos não aparecem no agendamento.
                </p>
              </div>
              <Controller
                name="ativo"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {field.value ? "Ativo" : "Inativo"}
                    </span>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="nome" className={labelClass}>
                Nome do serviço <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nome"
                className={inputClass}
                placeholder="Ex.: Corte Masculino"
                {...register("nome")}
              />
              {errors.nome && <p className={errorClass}>{errors.nome.message}</p>}
            </div>

            <div className="col-span-2 space-y-1">
              <Label htmlFor="idCategoria" className={labelClass}>
                Categoria <span className="text-destructive">*</span>
              </Label>
              <select
                id="idCategoria"
                {...register("idCategoria")}
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Selecione...</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
              {errors.idCategoria && (
                <p className={errorClass}>{errors.idCategoria.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="duracaoMinutos" className={labelClass}>
                Duração (minutos) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="duracaoMinutos"
                type="number"
                min={1}
                step={5}
                className={inputClass}
                {...register("duracaoMinutos", { valueAsNumber: true })}
              />
              {errors.duracaoMinutos && (
                <p className={errorClass}>{errors.duracaoMinutos.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="preco" className={labelClass}>
                Preço (R$) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="preco"
                type="number"
                min={0}
                step={0.01}
                className={inputClass}
                {...register("preco", { valueAsNumber: true })}
              />
              {errors.preco && <p className={errorClass}>{errors.preco.message}</p>}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Observações{" "}
              <span className="font-normal normal-case tracking-normal">
                (opcional)
              </span>
            </p>
            <Textarea
              placeholder="Informações adicionais sobre o serviço..."
              className="resize-none text-sm"
              rows={3}
              {...register("observacoes")}
            />
          </div>

          {erroSubmit && (
            <p className="text-sm text-destructive text-center">{erroSubmit}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : editando
                  ? "Salvar alterações"
                  : "Salvar serviço"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
