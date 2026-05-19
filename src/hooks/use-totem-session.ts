"use client";

export const SESSION_KEYS = {
  TOTEM_CLIENTE: "totem-cliente",
  COMANDA_ID: "comanda-id",
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
}

export function getComandaId(): string | null {
  if (!guard()) return null;
  return sessionStorage.getItem(SESSION_KEYS.COMANDA_ID);
}

export function setComandaId(id: string): void {
  if (!guard()) return;
  sessionStorage.setItem(SESSION_KEYS.COMANDA_ID, id);
}

export function clearTotemSession(): void {
  if (!guard()) return;
  sessionStorage.removeItem(SESSION_KEYS.TOTEM_CLIENTE);
  sessionStorage.removeItem(SESSION_KEYS.COMANDA_ID);
}

export function isAuthenticated(): boolean {
  const cliente = getCliente();
  return cliente !== null && cliente !== "guest";
}

export function useTotemSession() {
  return {
    getCliente,
    setCliente,
    getComandaId,
    setComandaId,
    clearTotemSession,
    isAuthenticated,
    SESSION_KEYS,
  };
}
