"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Pencil, Tag } from "lucide-react";
import type { CategoriaServico, Servico } from "@/lib/types";
import { ServicoDialog } from "@/components/servicos/servico-dialog";
import { CategoriasDialog } from "@/components/servicos/categorias-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ServicosViewProps {
  servicos: Servico[];
  categorias: CategoriaServico[];
}

function formatarPreco(preco: number) {
  return preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ServicosView({ servicos, categorias }: ServicosViewProps) {
  const [busca, setBusca] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [categoriasDialogAberto, setCategoriasDialogAberto] = useState(false);
  const [servicoEmEdicao, setServicoEmEdicao] = useState<Servico | undefined>();

  const servicosFiltrados = useMemo(() => {
    if (!busca.trim()) return servicos;
    const termo = busca.toLowerCase();
    return servicos.filter(
      (s) =>
        s.nome.toLowerCase().includes(termo) ||
        s.categoriaNome?.toLowerCase().includes(termo)
    );
  }, [servicos, busca]);

  function abrirNovo() {
    setServicoEmEdicao(undefined);
    setDialogAberto(true);
  }

  function abrirEdicao(servico: Servico) {
    setServicoEmEdicao(servico);
    setDialogAberto(true);
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Serviços e Preços</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {servicos.length}{" "}
            {servicos.length === 1 ? "serviço cadastrado" : "serviços cadastrados"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setCategoriasDialogAberto(true)}>
            <Tag className="size-4" />
            Categorias
          </Button>
          <Button onClick={abrirNovo}>
            <Plus className="size-4" />
            Novo serviço
          </Button>
        </div>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por nome ou categoria..."
          className="pl-8"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {servicosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-12"
                >
                  {busca
                    ? "Nenhum serviço encontrado para esta busca."
                    : "Nenhum serviço cadastrado ainda."}
                </TableCell>
              </TableRow>
            ) : (
              servicosFiltrados.map((servico) => (
                <TableRow key={servico.id}>
                  <TableCell className="font-medium">{servico.nome}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {servico.categoriaNome ?? "—"}
                  </TableCell>
                  <TableCell>{servico.duracaoMinutos} min</TableCell>
                  <TableCell>{formatarPreco(servico.preco)}</TableCell>
                  <TableCell>
                    <Badge variant={servico.ativo ? "default" : "secondary"}>
                      {servico.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Editar serviço"
                      onClick={() => abrirEdicao(servico)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ServicoDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        categorias={categorias}
        servico={servicoEmEdicao}
      />

      <CategoriasDialog
        open={categoriasDialogAberto}
        onOpenChange={setCategoriasDialogAberto}
        categorias={categorias}
      />
    </div>
  );
}
