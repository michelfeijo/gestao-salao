"use client";

import { useState, useMemo } from "react";
import { Search, UserPlus, Pencil } from "lucide-react";
import { Cliente } from "@/lib/types";
import { ClienteDialog } from "@/components/clientes/cliente-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const GENERO_LABEL: Record<string, string> = {
  feminino: "Feminino",
  masculino: "Masculino",
  "nao-binario": "Não binário",
  "prefiro-nao-informar": "Prefiro não informar",
};

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

interface ClientesViewProps {
  clientes: Cliente[];
}

export function ClientesView({ clientes }: ClientesViewProps) {
  const [busca, setBusca] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [clienteEmEdicao, setClienteEmEdicao] = useState<Cliente | undefined>();

  const clientesFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().replace(/\D/g, "") || busca.toLowerCase();
    if (!busca.trim()) return clientes;

    return clientes.filter((c) => {
      const nomeMatch = c.nome.toLowerCase().includes(busca.toLowerCase());
      const cpfMatch = c.cpf.replace(/\D/g, "").includes(termo);
      return nomeMatch || cpfMatch;
    });
  }, [clientes, busca]);

  const cpfsExistentes = clientes
    .filter((c) => c.id !== clienteEmEdicao?.id)
    .map((c) => c.cpf);

  function abrirNovo() {
    setClienteEmEdicao(undefined);
    setDialogAberto(true);
  }

  function abrirEdicao(cliente: Cliente) {
    setClienteEmEdicao(cliente);
    setDialogAberto(true);
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}{" "}
            cadastrado{clientes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={abrirNovo}>
          <UserPlus className="size-4" />
          Novo cliente
        </Button>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por nome ou CPF..."
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
              <TableHead>CPF</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Nascimento</TableHead>
              <TableHead>Gênero</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientesFiltrados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-12"
                >
                  {busca
                    ? "Nenhum cliente encontrado para esta busca."
                    : "Nenhum cliente cadastrado ainda."}
                </TableCell>
              </TableRow>
            ) : (
              clientesFiltrados.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.nome}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {cliente.cpf}
                  </TableCell>
                  <TableCell>{cliente.telefone}</TableCell>
                  <TableCell>{formatarData(cliente.dataNascimento)}</TableCell>
                  <TableCell>{GENERO_LABEL[cliente.genero] ?? "—"}</TableCell>
                  <TableCell>
                    {cliente.cidade
                      ? `${cliente.cidade}${cliente.estado ? ` / ${cliente.estado}` : ""}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Editar cliente"
                      onClick={() => abrirEdicao(cliente)}
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

      <ClienteDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        cpfsExistentes={cpfsExistentes}
        cliente={clienteEmEdicao}
      />
    </div>
  );
}
