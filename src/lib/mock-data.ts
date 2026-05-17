import { Client, Service, Product } from '@/types';

const MOCK_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'João Silva',
    cpf: '12345678901',
    phone: '11988887777',
    birthDate: '1990-05-15', // Adult
  },
  {
    id: 'client-2',
    name: 'Pedro Alvares',
    cpf: '98765432100',
    phone: '11977776666',
    birthDate: '2010-10-10', // Minor
  },
];

export const MOCK_SERVICES: Service[] = [
  { id: 's1', name: 'Corte de Cabelo', price: 50.0 },
  { id: 's2', name: 'Barba', price: 35.0 },
  { id: 's3', name: 'Combo (Corte + Barba)', price: 75.0 },
  { id: 's4', name: 'Hidratação', price: 40.0 },
  { id: 's5', name: 'Sobrancelha', price: 20.0 },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Coca-Cola', price: 8.0, isAlcoholic: false },
  { id: 'p2', name: 'Água Mineral', price: 4.0, isAlcoholic: false },
  { id: 'p3', name: 'Cerveja Heineken', price: 15.0, isAlcoholic: true },
  { id: 'p4', name: 'Suco de Laranja', price: 10.0, isAlcoholic: false },
  { id: 'p5', name: 'Whisky 50ml', price: 25.0, isAlcoholic: true },
  { id: 'p6', name: 'Energético Monster', price: 12.0, isAlcoholic: false },
  { id: 'p7', name: 'Café Expresso', price: 6.0, isAlcoholic: false },
  { id: 'p8', name: 'Água Tônica', price: 7.0, isAlcoholic: false },
];

// Mock appointments linking clients to scheduled services
export const MOCK_APPOINTMENTS: { clientId: string; serviceId: string }[] = [
  { clientId: 'client-1', serviceId: 's1' },
  { clientId: 'client-2', serviceId: 's3' },
];

// Mutable clients array so newly registered clients persist during the session
let _clients = [...MOCK_CLIENTS];
let nextClientId = 3;

export const findClientByCpf = (cpf: string): Client | undefined => {
  return _clients.find((c) => c.cpf === cpf);
};

export const createClient = (
  name: string,
  cpf: string,
  phone: string,
  birthDate: string
): Client => {
  const newClient: Client = {
    id: `client-${nextClientId++}`,
    name,
    cpf,
    phone,
    birthDate,
  };
  _clients.push(newClient);
  return newClient;
};

export const getClientAppointmentService = (
  clientId: string
): Service | undefined => {
  const appointment = MOCK_APPOINTMENTS.find((a) => a.clientId === clientId);
  if (!appointment) return undefined;
  return MOCK_SERVICES.find((s) => s.id === appointment.serviceId);
};

export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }
  return age;
};

export const isAdult = (birthDate: string): boolean =>
  calculateAge(birthDate) >= 18;

export const getFilteredProducts = (birthDate: string): Product[] => {
  if (isAdult(birthDate)) return MOCK_PRODUCTS;
  return MOCK_PRODUCTS.filter((p) => !p.isAlcoholic);
};
