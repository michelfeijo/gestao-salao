export const CORES_AGENDA = [
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#78716c",
];

export function corAleatoria(): string {
  return CORES_AGENDA[Math.floor(Math.random() * CORES_AGENDA.length)];
}
