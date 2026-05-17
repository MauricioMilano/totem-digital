export type Client = {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  birthDate: string; // ISO format YYYY-MM-DD
};

export type Service = {
  id: string;
  name: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  isAlcoholic: boolean;
};

export type OrderStatus = 'open' | 'closed';

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'service' | 'product';
  productId?: string;
  isAlcoholic?: boolean;
  isCourtesy?: boolean;
};

export type Order = {
  id: string;
  clientId: string;
  clientName: string;
  items: OrderItem[];
  totalValue: number;
  status: OrderStatus;
  createdAt: string; // ISO string for serialization
  updatedAt: string;
};
