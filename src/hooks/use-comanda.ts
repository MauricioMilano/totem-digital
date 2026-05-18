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
  formaPagamentoId: string | null;
  formaPagamentoNome: string;
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
  formaPagamentoId: null,
  formaPagamentoNome: "",
  quantidadeParcelas: 1,
  maioridade: false,
};

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function getComandaState(): ComandaState {
  return { ...comandaState };
}

export function subscribeToComanda(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setCliente(id: string, nome: string, cpf: string) {
  comandaState = { ...comandaState, customerStatus: "IDENTIFIED", clienteId: id, clienteNome: nome, clienteCpf: cpf };
  notifyListeners();
}

export function setCustomerStatus(status: CustomerStatus) {
  comandaState = { ...comandaState, customerStatus: status };
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
  notifyListeners();
}

export function removeItem(index: number) {
  const updated = comandaState.itens.filter((_, i) => i !== index);
  comandaState = { ...comandaState, itens: updated };
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
  notifyListeners();
}

export function setFormaPagamento(
  formaPagamentoId: string,
  formaPagamentoNome: string,
  maximoParcelas: number
) {
  comandaState = {
    ...comandaState,
    formaPagamentoId,
    formaPagamentoNome,
    quantidadeParcelas: 1,
  };
  notifyListeners();
}

export function setQuantidadeParcelas(quantidade: number) {
  comandaState = { ...comandaState, quantidadeParcelas: quantidade };
  notifyListeners();
}

export function setMaioridade(value: boolean) {
  comandaState = { ...comandaState, maioridade: value };
  notifyListeners();
}

export function limparComanda() {
  comandaState = {
    customerStatus: "GUEST",
    clienteId: null,
    clienteNome: "",
    clienteCpf: "",
    itens: [],
    formaPagamentoId: null,
    formaPagamentoNome: "",
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
