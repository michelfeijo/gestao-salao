"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profissionalSchema,
  CARGOS,
  type ProfissionalFormData,
} from "@/lib/validations/profissional";
import { maskCPF, maskTelefone } from "@/lib/utils/cpf";
import { CORES_AGENDA, corAleatoria } from "@/lib/utils/cor";
import { criarProfissional, atualizarProfissional } from "@/app/profissionais/actions";
import { cn } from "@/lib/utils";
import type { Profissional, Servico } from "@/lib/types";
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

interface ProfissionalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cpfsExistentes: string[];
  profissional?: Profissional;
  servicos: Servico[];
}

function valoresIniciais(profissional?: Profissional): ProfissionalFormData {
  if (!profissional) {
    return {
      nome: "",
      telefone: "",
      email: "",
      cpf: "",
      cargo: "",
      especialidades: "",
      cor: corAleatoria(),
      dataInicio: "",
      observacoes: "",
      ativo: true,
      servicoIds: [],
    };
  }

  return {
    nome: profissional.nome,
    telefone: profissional.telefone,
    email: profissional.email ?? "",
    cpf: profissional.cpf ?? "",
    cargo: profissional.cargo,
    especialidades: profissional.especialidades ?? "",
    cor: profissional.cor,
    dataInicio: profissional.dataInicio ?? "",
    observacoes: profissional.observacoes ?? "",
    ativo: profissional.ativo,
    servicoIds: profissional.servicoIds,
  };
}

export function ProfissionalDialog({
  open,
  onOpenChange,
  cpfsExistentes,
  profissional,
  servicos,
}: ProfissionalDialogProps) {
  const [erroSubmit, setErroSubmit] = useState<string | null>(null);
  const editando = Boolean(profissional);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfissionalFormData>({
    resolver: zodResolver(profissionalSchema),
    defaultValues: valoresIniciais(profissional),
  });

  useEffect(() => {
    if (open) reset(valoresIniciais(profissional));
  }, [open, profissional, reset]);

  async function onSubmit(data: ProfissionalFormData) {
    const cpfLimpo = data.cpf?.replace(/\D/g, "");

    if (
      cpfLimpo &&
      cpfsExistentes.some((c) => c.replace(/\D/g, "") === cpfLimpo)
    ) {
      setError("cpf", {
        message: "Já existe um profissional cadastrado com este CPF.",
      });
      return;
    }

    setErroSubmit(null);
    const result = profissional
      ? await atualizarProfissional(profissional.id, data)
      : await criarProfissional(data);

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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editando ? "Editar Profissional" : "Novo Profissional"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {editando && (
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-xs text-muted-foreground">
                  Profissionais inativos não aparecem na agenda.
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

          {/* Dados Pessoais */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Dados Pessoais
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="nome" className={labelClass}>
                  Nome completo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nome"
                  className={inputClass}
                  placeholder="Nome completo"
                  {...register("nome")}
                />
                {errors.nome && (
                  <p className={errorClass}>{errors.nome.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="telefone" className={labelClass}>
                  Telefone / WhatsApp <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="telefone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="telefone"
                      className={inputClass}
                      placeholder="(00) 00000-0000"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(maskTelefone(e.target.value))
                      }
                    />
                  )}
                />
                {errors.telefone && (
                  <p className={errorClass}>{errors.telefone.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className={labelClass}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  className={inputClass}
                  placeholder="email@exemplo.com"
                  {...register("email")}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cpf" className={labelClass}>
                  CPF
                </Label>
                <Controller
                  name="cpf"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="cpf"
                      className={inputClass}
                      placeholder="000.000.000-00"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(maskCPF(e.target.value))}
                    />
                  )}
                />
                {errors.cpf && (
                  <p className={errorClass}>{errors.cpf.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Dados Profissionais */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Dados Profissionais
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cargo" className={labelClass}>
                  Função <span className="text-destructive">*</span>
                </Label>
                <select
                  id="cargo"
                  {...register("cargo")}
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Selecione...</option>
                  {CARGOS.map((cargo) => (
                    <option key={cargo} value={cargo}>
                      {cargo}
                    </option>
                  ))}
                </select>
                {errors.cargo && (
                  <p className={errorClass}>{errors.cargo.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="dataInicio" className={labelClass}>
                  Data de início
                </Label>
                <Input
                  id="dataInicio"
                  type="date"
                  className={inputClass}
                  {...register("dataInicio")}
                />
              </div>

              <div className="col-span-2 space-y-1">
                <Label htmlFor="especialidades" className={labelClass}>
                  Especialidades
                </Label>
                <Input
                  id="especialidades"
                  className={inputClass}
                  placeholder="Coloração, alisamento, corte masculino..."
                  {...register("especialidades")}
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label className={labelClass}>
                  Cor na agenda <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="cor"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {CORES_AGENDA.map((cor) => (
                        <button
                          key={cor}
                          type="button"
                          aria-label={`Selecionar cor ${cor}`}
                          onClick={() => field.onChange(cor)}
                          className={cn(
                            "size-6 rounded-full ring-offset-2 ring-offset-background transition-all",
                            field.value === cor && "ring-2 ring-foreground"
                          )}
                          style={{ backgroundColor: cor }}
                        />
                      ))}
                    </div>
                  )}
                />
                {errors.cor && (
                  <p className={errorClass}>{errors.cor.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Serviços realizados */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Serviços realizados{" "}
              <span className="font-normal normal-case tracking-normal">
                (opcional)
              </span>
            </p>
            {servicos.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nenhum serviço ativo cadastrado ainda.
              </p>
            ) : (
              <Controller
                name="servicoIds"
                control={control}
                render={({ field }) => {
                  const grupos = servicos.reduce<Record<string, Servico[]>>(
                    (acc, servico) => {
                      const grupo = servico.categoriaNome ?? "Sem categoria";
                      acc[grupo] = acc[grupo] ?? [];
                      acc[grupo].push(servico);
                      return acc;
                    },
                    {}
                  );

                  function toggle(id: string) {
                    const atual = field.value ?? [];
                    field.onChange(
                      atual.includes(id)
                        ? atual.filter((s) => s !== id)
                        : [...atual, id]
                    );
                  }

                  return (
                    <div className="max-h-48 overflow-y-auto rounded-lg border p-3 space-y-3">
                      {Object.entries(grupos).map(([categoria, itens]) => (
                        <div key={categoria} className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground">
                            {categoria}
                          </p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {itens.map((servico) => (
                              <label
                                key={servico.id}
                                className="flex items-center gap-2 text-sm"
                              >
                                <input
                                  type="checkbox"
                                  className="size-3.5 rounded border-input"
                                  checked={(field.value ?? []).includes(servico.id)}
                                  onChange={() => toggle(servico.id)}
                                />
                                {servico.nome}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
            )}
          </div>

          <Separator />

          {/* Observações */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Observações{" "}
              <span className="font-normal normal-case tracking-normal">
                (opcional)
              </span>
            </p>
            <Textarea
              placeholder="Informações adicionais sobre o profissional..."
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
                  : "Salvar profissional"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
