'use client';

import { useState } from 'react';
import { useOrders } from '@/context/OrderContext';
import { OrderCard } from '@/components/professional/order-card';
import { OrderDetailModal } from '@/components/professional/order-detail-modal';
import { Scissors, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfessionalPage() {
  const { getActiveOrders, closeOrder, reopenOrder, getOrder } = useOrders();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const activeOrders = getActiveOrders();
  const selectedOrder = selectedOrderId ? getOrder(selectedOrderId) : undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <Scissors className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Painel do Profissional</h1>
              <p className="text-sm text-muted-foreground">
                {activeOrders.length} pedido(s) ativo(s)
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            title="Recarregar dados do armazenamento local"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => setSelectedOrderId(order.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Scissors className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-muted-foreground mb-2">
              Nenhum pedido ativo
            </h2>
            <p className="text-muted-foreground max-w-sm">
              Os pedidos feitos pelos clientes no totem aparecerão aqui.
            </p>
          </div>
        )}
      </main>

      {/* Order detail / payment modal */}
      {selectedOrder && (
        <OrderDetailModal
          key={selectedOrder.id}
          order={selectedOrder}
          isOpen={!!selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onCloseOrder={closeOrder}
          onReopenOrder={reopenOrder}
        />
      )}
    </div>
  );
}
