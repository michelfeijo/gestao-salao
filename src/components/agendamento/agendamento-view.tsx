"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Agendamento, Servico } from "@/lib/types";
import { minutosDesdeMeiaNoite } from "@/lib/utils/data-hora";
import { AgendamentoDialog } from "@/components/agendamento/agendamento-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfissionalResumo {
  id: string;
  nome: string;
  cor: string;
}

interface ClienteResumo {
  id: string;
  nome: string;
}

interface AgendamentoViewProps {
  data: string;
  profissionais: ProfissionalResumo[];
  servicos: Servico[];
  clientes: ClienteResumo[];
  agendamentos: Agendamento[];
}

const HORA_ABERTURA = 8;
const HORA_FECHAMENTO = 20;
const SLOT_MINUTOS = 30;
const PX_POR_MINUTO = 1.4;

const TOTAL_MINUTOS = (HORA_FECHAMENTO - HORA_ABERTURA) * 60;
const TOTAL_SLOTS = TOTAL_MINUTOS / SLOT_MINUTOS;

function horaDoSlot(slotIndex: number): string {
  const totalMin = HORA_ABERTURA * 60 + slotIndex * SLOT_MINUTOS;
  const h = Math.floor(totalMin / 60).toString().padStart(2, "0");
  const m = (totalMin % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function somarDias(data: string, dias: number): string {
  const [ano, mes, dia] = data.split("-").map(Number);
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

function formatarDataExtenso(data: string): string {
  const [ano, mes, dia] = data.split("-").map(Number);
  const d = new Date(Date.UTC(ano, mes - 1, dia, 12));
  return d.toLocaleDateString("pt-BR", {
    timeZone: "UTC",
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export function AgendamentoView({
  data,
  profissionais,
  servicos,
  clientes,
  agendamentos,
}: AgendamentoViewProps) {
  const router = useRouter();
  const [dialogAberto, setDialogAberto] = useState(false);
  const [agendamentoEmEdicao, setAgendamentoEmEdicao] = useState<Agendamento | undefined>();
  const [prefill, setPrefill] = useState<{ idProfissional?: string; horaInicio?: string }>();

  const agendamentosPorProfissional = useMemo(() => {
    const mapa = new Map<string, Agendamento[]>();
    for (const ag of agendamentos) {
      const lista = mapa.get(ag.idProfissional) ?? [];
      lista.push(ag);
      mapa.set(ag.idProfissional, lista);
    }
    return mapa;
  }, [agendamentos]);

  const timeLabels = useMemo(
    () => Array.from({ length: TOTAL_SLOTS }, (_, i) => horaDoSlot(i)),
    []
  );

  function irPara(novaData: string) {
    router.push(`/agendamento?data=${novaData}`);
  }

  function abrirNovo(idProfissional: string, slotIndex: number) {
    setAgendamentoEmEdicao(undefined);
    setPrefill({ idProfissional, horaInicio: horaDoSlot(slotIndex) });
    setDialogAberto(true);
  }

  function abrirNovoGeral() {
    setAgendamentoEmEdicao(undefined);
    setPrefill(undefined);
    setDialogAberto(true);
  }

  function abrirEdicao(agendamento: Agendamento) {
    setAgendamentoEmEdicao(agendamento);
    setPrefill(undefined);
    setDialogAberto(true);
  }

  return (
    <div className="p-8 flex flex-col h-screen">
      <div className="mb-6 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Agendamento</h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">
            {formatarDataExtenso(data)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => irPara(somarDias(data, -1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <Input
            type="date"
            value={data}
            onChange={(e) => irPara(e.target.value)}
            className="w-40"
          />
          <Button variant="outline" size="icon" onClick={() => irPara(somarDias(data, 1))}>
            <ChevronRight className="size-4" />
          </Button>
          <Button onClick={abrirNovoGeral}>
            <Plus className="size-4" />
            Novo agendamento
          </Button>
        </div>
      </div>

      {profissionais.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum profissional ativo cadastrado ainda. Cadastre profissionais para começar a
          agendar.
        </p>
      ) : (
        <div className="flex-1 overflow-auto rounded-xl border">
          <div className="flex border-b sticky top-0 bg-background z-20">
            <div className="w-16 shrink-0 border-r" />
            {profissionais.map((p) => (
              <div
                key={p.id}
                className="flex-1 min-w-36 px-2 py-2 border-l text-sm font-medium flex items-center gap-1.5"
              >
                <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: p.cor }} />
                <span className="truncate">{p.nome}</span>
              </div>
            ))}
          </div>

          <div className="flex">
            <div
              className="w-16 shrink-0 relative border-r"
              style={{ height: TOTAL_MINUTOS * PX_POR_MINUTO }}
            >
              {timeLabels.map((label, i) => (
                <div
                  key={label}
                  className="absolute right-2 -translate-y-1/2 text-xs text-muted-foreground"
                  style={{ top: i * SLOT_MINUTOS * PX_POR_MINUTO }}
                >
                  {label}
                </div>
              ))}
            </div>

            {profissionais.map((p) => (
              <div
                key={p.id}
                className="flex-1 min-w-36 relative border-l"
                style={{ height: TOTAL_MINUTOS * PX_POR_MINUTO }}
              >
                {timeLabels.map((_, slotIndex) => (
                  <button
                    key={slotIndex}
                    type="button"
                    aria-label="Novo agendamento neste horário"
                    className="absolute left-0 right-0 border-b border-dashed border-border/60 hover:bg-accent/40 transition-colors"
                    style={{
                      top: slotIndex * SLOT_MINUTOS * PX_POR_MINUTO,
                      height: SLOT_MINUTOS * PX_POR_MINUTO,
                    }}
                    onClick={() => abrirNovo(p.id, slotIndex)}
                  />
                ))}

                {(agendamentosPorProfissional.get(p.id) ?? []).map((ag) => {
                  const top = minutosDesdeMeiaNoite(ag.inicio) - HORA_ABERTURA * 60;
                  const duracao = ag.servicoDuracaoMinutos;
                  const cancelado = ag.status === "cancelado";
                  const concluido = ag.status === "concluido";

                  return (
                    <button
                      key={ag.id}
                      type="button"
                      className="absolute left-0.5 right-0.5 z-10 overflow-hidden rounded-md px-1.5 py-0.5 text-left text-xs text-white shadow-sm"
                      style={{
                        top: top * PX_POR_MINUTO,
                        height: Math.max(duracao * PX_POR_MINUTO, 20),
                        backgroundColor: p.cor,
                        opacity: cancelado ? 0.45 : 1,
                      }}
                      onClick={() => abrirEdicao(ag)}
                    >
                      <span className={cancelado ? "line-through" : ""}>
                        <span className="font-medium">{ag.clienteNome}</span>
                        {" — "}
                        {ag.servicoNome}
                        {concluido && " ✓"}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      <AgendamentoDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        clientes={clientes}
        profissionais={profissionais}
        servicos={servicos}
        agendamento={agendamentoEmEdicao}
        prefill={{ ...prefill, data }}
      />
    </div>
  );
}
