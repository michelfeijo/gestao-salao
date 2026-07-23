"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus } from "lucide-react";
import {
  categoriaServicoSchema,
  type CategoriaServicoFormData,
} from "@/lib/validations/categoria-servico";
import { criarCategoria, atualizarCategoria } from "@/app/servicos/actions";
import type { CategoriaServico } from "@/lib/types";
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

interface CategoriasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categorias: CategoriaServico[];
}

export function CategoriasDialog({
  open,
  onOpenChange,
  categorias,
}: CategoriasDialogProps) {
  const [categoriaEmEdicao, setCategoriaEmEdicao] = useState<
    CategoriaServico | undefined
  >();
  const [criandoNova, setCriandoNova] = useState(false);
  const [erroSubmit, setErroSubmit] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoriaServicoFormData>({
    resolver: zodResolver(categoriaServicoSchema),
    defaultValues: { nome: "" },
  });

  const emFormulario = criandoNova || Boolean(categoriaEmEdicao);

  useEffect(() => {
    if (!open) {
      setCategoriaEmEdicao(undefined);
      setCriandoNova(false);
      setErroSubmit(null);
    }
  }, [open]);

  useEffect(() => {
    reset({ nome: categoriaEmEdicao?.nome ?? "" });
  }, [categoriaEmEdicao, criandoNova, reset]);

  async function onSubmit(data: CategoriaServicoFormData) {
    setErroSubmit(null);
    const result = categoriaEmEdicao
      ? await atualizarCategoria(categoriaEmEdicao.id, data)
      : await criarCategoria(data);

    if (result?.error) {
      setErroSubmit(result.error);
      return;
    }

    setCategoriaEmEdicao(undefined);
    setCriandoNova(false);
  }

  function handleClose() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Categorias de Serviço</DialogTitle>
        </DialogHeader>

        {emFormulario ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="categoria-nome" className="text-xs font-medium text-muted-foreground">
                Nome da categoria <span className="text-destructive">*</span>
              </Label>
              <Input
                id="categoria-nome"
                className="h-9 text-sm"
                placeholder="Ex.: Cabelo, Unhas, Estética..."
                autoFocus
                {...register("nome")}
              />
              {errors.nome && (
                <p className="text-xs text-destructive mt-0.5">{errors.nome.message}</p>
              )}
            </div>

            {erroSubmit && (
              <p className="text-sm text-destructive text-center">{erroSubmit}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCategoriaEmEdicao(undefined);
                  setCriandoNova(false);
                }}
              >
                Voltar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="max-h-72 overflow-y-auto rounded-lg border">
              {categorias.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Nenhuma categoria cadastrada ainda.
                </p>
              ) : (
                categorias.map((categoria) => (
                  <div
                    key={categoria.id}
                    className="flex items-center justify-between px-3 py-2 border-b last:border-b-0 text-sm"
                  >
                    {categoria.nome}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Editar categoria"
                      onClick={() => setCategoriaEmEdicao(categoria)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setCriandoNova(true)}
            >
              <Plus className="size-4" />
              Nova categoria
            </Button>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Fechar
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
