import { setCliente as setSessionCliente, clearTotemSession } from "@/hooks/use-totem-session";

const STORAGE_KEY_CARRINHO = "totem-carrinho";

export type CustomerStatus = "IDENTIFIED" | "REGISTERING" | "GUEST";

export interface ItemSelecionado {
  tipo: "servico" | "bebida" | "produto";
  id: string;
  nomeItem: string;
  precoUnit: number;
  quantidade: number;
  servicoId?: string;
  bebidaId?: string;
  produtoId?: string;
}

export interface ComandaState {
  customerStatus: CustomerStatus;
  clienteId: string | null;
  clienteNome: string;
  clienteCpf: string;
  itens: ItemSelecionado[];
  quantidadeParcelas: number;
  maioridade: boolean;
}

// Global state for the totem flow
let comandaState: ComandaState = {
  customerStatus: "GUEST",
  clienteId: null,
  clienteNome: "",
  clienteCpf: "",
  itens: [],
  quantidadeParcelas: 1,
  maioridade: false,
};

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function persistState() {
  if (typeof window === "undefined") return;
  const data = {
    itens: comandaState.itens,
    quantidadeParcelas: comandaState.quantidadeParcelas,
    maioridade: comandaState.maioridade,
  };
  sessionStorage.setItem(STORAGE_KEY_CARRINHO, JSON.stringify(data));
}

export function hydrateComandaFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  const raw = sessionStorage.getItem(STORAGE_KEY_CARRINHO);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    comandaState = {
      ...comandaState,
      itens: data.itens ?? [],
      quantidadeParcelas: data.quantidadeParcelas ?? 1,
      maioridade: data.maioridade ?? false,
    };
    return true;
  } catch {
    return false;
  }
}

export function getComandaState(): ComandaState {
  return { ...comandaState };
}

export function subscribeToComanda(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setCliente(id: string, nome: string, cpf: string) {
  setSessionCliente(id);
  comandaState = { ...comandaState, customerStatus: "IDENTIFIED", clienteId: id, clienteNome: nome, clienteCpf: cpf };
  persistState();
  notifyListeners();
}

export function setCustomerStatus(status: CustomerStatus) {
  if (status === "GUEST") {
    setSessionCliente("guest");
  }
  comandaState = { ...comandaState, customerStatus: status };
  persistState();
  notifyListeners();
}

export function addItem(item: ItemSelecionado) {
  // Check if item already exists
  const existingIndex = comandaState.itens.findIndex(
    (i) => i.tipo === item.tipo && i.id === item.id
  );

  if (existingIndex >= 0) {
    const updated = [...comandaState.itens];
    updated[existingIndex] = {
      ...updated[existingIndex],
      quantidade: updated[existingIndex].quantidade + 1,
    };
    comandaState = { ...comandaState, itens: updated };
  } else {
    comandaState = {
      ...comandaState,
      itens: [...comandaState.itens, item],
    };
  }
  persistState();
  notifyListeners();
}

export function removeItem(index: number) {
  const updated = comandaState.itens.filter((_, i) => i !== index);
  comandaState = { ...comandaState, itens: updated };
  persistState();
  notifyListeners();
}

export function updateQuantidade(index: number, quantidade: number) {
  if (quantidade <= 0) {
    removeItem(index);
    return;
  }
  const updated = [...comandaState.itens];
  updated[index] = { ...updated[index], quantidade };
  comandaState = { ...comandaState, itens: updated };
  persistState();
  notifyListeners();
}

export function setQuantidadeParcelas(quantidade: number) {
  comandaState = { ...comandaState, quantidadeParcelas: quantidade };
  persistState();
  notifyListeners();
}

export function setMaioridade(value: boolean) {
  comandaState = { ...comandaState, maioridade: value };
  persistState();
  notifyListeners();
}

export function limparComanda() {
  clearTotemSession();
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEY_CARRINHO);
  }
  comandaState = {
    customerStatus: "GUEST",
    clienteId: null,
    clienteNome: "",
    clienteCpf: "",
    itens: [],
    quantidadeParcelas: 1,
    maioridade: false,
  };
  notifyListeners();
}

export function getTotal(): number {
  return comandaState.itens.reduce(
    (acc, item) => acc + item.precoUnit * item.quantidade,
    0
  );
}
