"use client";

export const SESSION_KEYS = {
  TOTEM_CLIENTE: "totem-cliente",
  COMANDA_ID: "comanda-id",
  LAST_ACTIVITY: "totem-last-activity",
} as const;

function guard() {
  return typeof window !== "undefined";
}

export function getCliente(): string | null {
  if (!guard()) return null;
  return sessionStorage.getItem(SESSION_KEYS.TOTEM_CLIENTE);
}

export function setCliente(id: string): void {
  if (!guard()) return;
  sessionStorage.setItem(SESSION_KEYS.TOTEM_CLIENTE, id);
  updateLastActivity();
}

export function updateLastActivity(): void {
  if (!guard()) return;
  sessionStorage.setItem(SESSION_KEYS.LAST_ACTIVITY, Date.now().toString());
}

export function getLastActivity(): number | null {
  if (!guard()) return null;
  const last = sessionStorage.getItem(SESSION_KEYS.LAST_ACTIVITY);
  return last ? Number(last) : null;
}

export function getComandaId(): string | null {
  if (!guard()) return null;
  return sessionStorage.getItem(SESSION_KEYS.COMANDA_ID);
}

export function setComandaId(id: string): void {
  if (!guard()) return;
  sessionStorage.setItem(SESSION_KEYS.COMANDA_ID, id);
  updateLastActivity();
}

export function clearTotemSession(): void {
  if (!guard()) return;
  sessionStorage.removeItem(SESSION_KEYS.TOTEM_CLIENTE);
  sessionStorage.removeItem(SESSION_KEYS.COMANDA_ID);
  sessionStorage.removeItem(SESSION_KEYS.LAST_ACTIVITY);
}

export function isAuthenticated(): boolean {
  const cliente = getCliente();
  return cliente !== null && cliente !== "guest";
}

export function useTotemSession() {
  return {
    getCliente,
    setCliente,
    updateLastActivity,
    getLastActivity,
    getComandaId,
    setComandaId,
    clearTotemSession,
    isAuthenticated,
    SESSION_KEYS,
  };
}
