"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { clienteSchema, type ClienteFormData } from "@/lib/validations/cliente";
import { maskCPF, maskTelefone, maskCEP } from "@/lib/utils/cpf";
import { criarCliente, atualizarCliente } from "@/app/clientes/actions";
import type { Cliente } from "@/lib/types";
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

interface ClienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cpfsExistentes: string[];
  cliente?: Cliente;
}

function valoresIniciais(cliente?: Cliente): ClienteFormData {
  if (!cliente) {
    return {
      cpf: "",
      nome: "",
      telefone: "",
      dataNascimento: "",
      genero: "",
      email: "",
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      observacoes: "",
    };
  }

  return {
    cpf: cliente.cpf,
    nome: cliente.nome,
    telefone: cliente.telefone,
    dataNascimento: cliente.dataNascimento,
    genero: cliente.genero,
    email: cliente.email ?? "",
    cep: cliente.cep ?? "",
    rua: cliente.rua ?? "",
    numero: cliente.numero ?? "",
    complemento: cliente.complemento ?? "",
    bairro: cliente.bairro ?? "",
    cidade: cliente.cidade ?? "",
    estado: cliente.estado ?? "",
    observacoes: cliente.observacoes ?? "",
  };
}

export function ClienteDialog({
  open,
  onOpenChange,
  cpfsExistentes,
  cliente,
}: ClienteDialogProps) {
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [erroCEP, setErroCEP] = useState<string | null>(null);
  const [erroSubmit, setErroSubmit] = useState<string | null>(null);
  const editando = Boolean(cliente);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: valoresIniciais(cliente),
  });

  useEffect(() => {
    if (open) reset(valoresIniciais(cliente));
  }, [open, cliente, reset]);

  async function buscarCEP(cep: string) {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setBuscandoCEP(true);
    setErroCEP(null);

    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();

      if (data.erro) {
        setErroCEP("CEP não encontrado");
        return;
      }

      setValue("rua", data.logradouro || "");
      setValue("bairro", data.bairro || "");
      setValue("cidade", data.localidade || "");
      setValue("estado", data.uf || "");
    } catch {
      setErroCEP("Erro ao buscar CEP");
    } finally {
      setBuscandoCEP(false);
    }
  }

  async function onSubmit(data: ClienteFormData) {
    const cpfLimpo = data.cpf.replace(/\D/g, "");

    if (cpfsExistentes.some((c) => c.replace(/\D/g, "") === cpfLimpo)) {
      setError("cpf", { message: "Já existe um cliente cadastrado com este CPF." });
      return;
    }

    setErroSubmit(null);
    const result = cliente
      ? await atualizarCliente(cliente.id, data)
      : await criarCliente(data);

    if (result?.error) {
      setErroSubmit(result.error);
      return;
    }

    onOpenChange(false);
  }

  function handleClose() {
    setErroCEP(null);
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
          <DialogTitle>{editando ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Dados Pessoais */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Dados Pessoais
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cpf" className={labelClass}>
                  CPF <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="cpf"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="cpf"
                      className={inputClass}
                      placeholder="000.000.000-00"
                      value={field.value}
                      onChange={(e) => field.onChange(maskCPF(e.target.value))}
                    />
                  )}
                />
                {errors.cpf && (
                  <p className={errorClass}>{errors.cpf.message}</p>
                )}
              </div>

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
                <Label htmlFor="dataNascimento" className={labelClass}>
                  Data de nascimento <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  className={inputClass}
                  {...register("dataNascimento")}
                />
                {errors.dataNascimento && (
                  <p className={errorClass}>{errors.dataNascimento.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="genero" className={labelClass}>
                  Gênero <span className="text-destructive">*</span>
                </Label>
                <select
                  id="genero"
                  {...register("genero")}
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Selecione...</option>
                  <option value="feminino">Feminino</option>
                  <option value="masculino">Masculino</option>
                  <option value="nao-binario">Não binário</option>
                  <option value="prefiro-nao-informar">
                    Prefiro não informar
                  </option>
                </select>
                {errors.genero && (
                  <p className={errorClass}>{errors.genero.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Endereço */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Endereço{" "}
              <span className="font-normal normal-case tracking-normal">
                (opcional)
              </span>
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cep" className={labelClass}>
                  CEP
                </Label>
                <div className="relative">
                  <Controller
                    name="cep"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="cep"
                        className={inputClass}
                        placeholder="00000-000"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const masked = maskCEP(e.target.value);
                          field.onChange(masked);
                          if (masked.replace(/\D/g, "").length === 8) {
                            buscarCEP(masked);
                          } else {
                            setErroCEP(null);
                          }
                        }}
                      />
                    )}
                  />
                  {buscandoCEP && (
                    <Loader2 className="absolute right-2.5 top-2 size-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                {erroCEP && <p className={errorClass}>{erroCEP}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="rua" className={labelClass}>
                  Rua / Logradouro
                </Label>
                <Input
                  id="rua"
                  className={inputClass}
                  placeholder="Rua, Avenida..."
                  {...register("rua")}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="numero" className={labelClass}>
                  Número
                </Label>
                <Input
                  id="numero"
                  className={inputClass}
                  placeholder="123"
                  {...register("numero")}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="complemento" className={labelClass}>
                  Complemento
                </Label>
                <Input
                  id="complemento"
                  className={inputClass}
                  placeholder="Apto, Bloco..."
                  {...register("complemento")}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="bairro" className={labelClass}>
                  Bairro
                </Label>
                <Input
                  id="bairro"
                  className={inputClass}
                  placeholder="Bairro"
                  {...register("bairro")}
                />
              </div>

              <div className="grid grid-cols-3 gap-3 col-span-2">
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="cidade" className={labelClass}>
                    Cidade
                  </Label>
                  <Input
                    id="cidade"
                    className={inputClass}
                    placeholder="Cidade"
                    {...register("cidade")}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="estado" className={labelClass}>
                    Estado
                  </Label>
                  <Input
                    id="estado"
                    className={inputClass}
                    placeholder="UF"
                    maxLength={2}
                    {...register("estado")}
                  />
                </div>
              </div>
            </div>
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
              placeholder="Alergias, preferências, histórico de cor..."
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
                  : "Salvar cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
