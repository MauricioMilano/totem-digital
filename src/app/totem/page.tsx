'use client';

import { useState } from 'react';
import { CheckinForm } from '@/components/totem/checkin-form';
import { OrderPanel } from '@/components/totem/order-panel';
import { Client } from '@/types';
import { useOrders } from '@/context/OrderContext';
import { getClientAppointmentService } from '@/lib/mock-data';

export default function TotemPage() {
  const [client, setClient] = useState<Client | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { getClientOrder, createOrder } = useOrders();

  const handleClientFound = (foundClient: Client) => {
    setClient(foundClient);

    // If there's already an open order for this client, resume it
    const existingOrder = getClientOrder(foundClient.id);
    if (existingOrder) {
      setOrderId(existingOrder.id);
      return;
    }

    // Otherwise create a new order from their appointment service
    const service = getClientAppointmentService(foundClient.id);
    if (service) {
      const newOrderId = createOrder(
        foundClient.id,
        foundClient.name,
        service.name,
        service.price
      );
      setOrderId(newOrderId);
    } else {
      // No appointment → create an order without a service
      const newOrderId = createOrder(
        foundClient.id,
        foundClient.name,
        'Sem serviço agendado',
        0
      );
      setOrderId(newOrderId);
    }
  };

  const handleBackToCheckin = () => {
    setClient(null);
    setOrderId(null);
  };

  // ---------- Check-in screen ----------
  if (!client || !orderId) {
    return <CheckinForm onClientFound={handleClientFound} />;
  }

  // ---------- Order panel ----------
  return (
    <OrderPanel
      client={client}
      orderId={orderId}
      onBackToCheckin={handleBackToCheckin}
    />
  );
}
