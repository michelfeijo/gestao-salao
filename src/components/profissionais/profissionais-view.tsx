"use client";

import { useState, useMemo } from "react";
import { Search, UserPlus, Pencil } from "lucide-react";
import { Profissional } from "@/lib/types";
import { ProfissionalDialog } from "@/components/profissionais/profissional-dialog";
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

interface ProfissionaisViewProps {
  profissionais: Profissional[];
}

export function ProfissionaisView({ profissionais }: ProfissionaisViewProps) {
  const [busca, setBusca] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [profissionalEmEdicao, setProfissionalEmEdicao] = useState<Profissional | undefined>();

  const profissionaisFiltrados = useMemo(() => {
    if (!busca.trim()) return profissionais;
    const termo = busca.toLowerCase();
    return profissionais.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.cargo.toLowerCase().includes(termo)
    );
  }, [profissionais, busca]);

  const cpfsExistentes = profissionais
    .filter((p) => p.id !== profissionalEmEdicao?.id)
    .map((p) => p.cpf)
    .filter((cpf): cpf is string => Boolean(cpf));

  function abrirNovo() {
    setProfissionalEmEdicao(undefined);
    setDialogAberto(true);
  }

  function abrirEdicao(profissional: Profissional) {
    setProfissionalEmEdicao(profissional);
    setDialogAberto(true);
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profissionais</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {profissionais.length}{" "}
            {profissionais.length === 1
              ? "profissional cadastrado"
              : "profissionais cadastrados"}
          </p>
        </div>
        <Button onClick={abrirNovo}>
          <UserPlus className="size-4" />
          Novo profissional
        </Button>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por nome ou função..."
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
              <TableHead>Função</TableHead>
              <TableHead>Especialidades</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {profissionaisFiltrados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-12"
                >
                  {busca
                    ? "Nenhum profissional encontrado para esta busca."
                    : "Nenhum profissional cadastrado ainda."}
                </TableCell>
              </TableRow>
            ) : (
              profissionaisFiltrados.map((profissional) => (
                <TableRow key={profissional.id}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: profissional.cor }}
                      />
                      {profissional.nome}
                    </span>
                  </TableCell>
                  <TableCell>{profissional.cargo}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {profissional.especialidades || "—"}
                  </TableCell>
                  <TableCell>{profissional.telefone}</TableCell>
                  <TableCell>
                    <Badge variant={profissional.ativo ? "default" : "secondary"}>
                      {profissional.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Editar profissional"
                      onClick={() => abrirEdicao(profissional)}
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

      <ProfissionalDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        cpfsExistentes={cpfsExistentes}
        profissional={profissionalEmEdicao}
      />
    </div>
  );
}
