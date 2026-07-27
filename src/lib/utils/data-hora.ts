const TIMEZONE_SALAO = "America/Sao_Paulo";
const OFFSET_SALAO = "-03:00";

export function combinarDataHora(data: string, hora: string): Date {
  return new Date(`${data}T${hora}:00${OFFSET_SALAO}`);
}

export function inicioDoDia(data: string): Date {
  return combinarDataHora(data, "00:00");
}

export function fimDoDia(data: string): Date {
  return new Date(inicioDoDia(data).getTime() + 24 * 60 * 60 * 1000);
}

export function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    timeZone: TIMEZONE_SALAO,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function dataISO(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: TIMEZONE_SALAO });
}

export function hojeISO(): string {
  return dataISO(new Date().toISOString());
}

export function minutosDesdeMeiaNoite(iso: string): number {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIMEZONE_SALAO,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));

  const hora = Number(partes.find((p) => p.type === "hour")?.value ?? 0);
  const minuto = Number(partes.find((p) => p.type === "minute")?.value ?? 0);
  return hora * 60 + minuto;
}
