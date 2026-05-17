'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Client } from '@/types';
import { useOrders } from '@/context/OrderContext';
import { getFilteredProducts } from '@/lib/mock-data';
import {
  Plus,
  Minus,
  Check,
  ShoppingCart,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderPanelProps {
  client: Client;
  orderId: string;
  onBackToCheckin: () => void;
}

export function OrderPanel({
  client,
  orderId,
  onBackToCheckin,
}: OrderPanelProps) {
  const { getOrder, addItem, removeItem, updateItemQuantity, setCourtesyDrink } =
    useOrders();
  const order = getOrder(orderId);
  const products = getFilteredProducts(client.birthDate);
  const [confirmed, setConfirmed] = useState(false);

  if (!order) return null;

  const serviceItem = order.items.find((i) => i.type === 'service');
  const courtesyItem = order.items.find((i) => i.isCourtesy);
  const productItems = order.items.filter(
    (i) => i.type === 'product' && !i.isCourtesy
  );

  const getProductQuantity = (productId: string): number => {
    const item = productItems.find((i) => i.productId === productId);
    return item?.quantity ?? 0;
  };

  const handleAddProduct = (
    productId: string,
    name: string,
    price: number,
    isAlcoholic: boolean
  ) => {
    addItem(orderId, {
      name,
      price,
      quantity: 1,
      type: 'product',
      productId,
      isAlcoholic,
    });
  };

  const handleRemoveProduct = (productId: string) => {
    const item = productItems.find((i) => i.productId === productId);
    if (!item) return;
    if (item.quantity <= 1) {
      removeItem(orderId, item.id);
    } else {
      updateItemQuantity(orderId, item.id, item.quantity - 1);
    }
  };

  const handleSetCourtesyDrink = (productId: string, name: string) => {
    setCourtesyDrink(orderId, productId, name);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    toast.success('✅ Pedido enviado para o barbeiro!');
  };

  // ---------- Confirmed state ----------
  if (confirmed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 text-center">
        <div className="bg-green-500/20 rounded-full p-6 mb-6">
          <Check className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">
          Pedido Confirmado!
        </h2>
        <p className="text-gray-400 mb-8 max-w-sm">
          Seu pedido foi enviado para o barbeiro. Em breve você será atendido.
        </p>
        <Button
          onClick={onBackToCheckin}
          variant="outline"
          size="lg"
          className="text-white border-gray-600 hover:bg-gray-700"
        >
          Fazer Novo Pedido
        </Button>
      </div>
    );
  }

  // ---------- Active order panel ----------

  const alcoholicProducts = products.filter((p) => p.isAlcoholic);
  const nonAlcoholicProducts = products.filter((p) => !p.isAlcoholic);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-black/30 px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBackToCheckin}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Badge
            variant="outline"
            className="text-white border-gray-600 text-xs"
          >
            Comanda #{order.id.slice(-6)}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold text-white">{client.name}</h1>
        {serviceItem && serviceItem.price > 0 ? (
          <p className="text-gray-400">
            {serviceItem.name} — R$ {serviceItem.price.toFixed(2)}
          </p>
        ) : (
          <p className="text-gray-500">Sem serviço agendado</p>
        )}
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-6 max-w-lg mx-auto">
          {/* ---- Courtesy Drink ---- */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-1">
              Bebida Cortesia
            </h2>
            <p className="text-sm text-gray-400 mb-3">
              Escolha uma bebida por conta da casa:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {products.map((product) => {
                const selected = courtesyItem?.productId === product.id;
                return (
                  <Button
                    key={product.id}
                    variant={selected ? 'default' : 'outline'}
                    className={`h-auto py-3 px-3 justify-start ${
                      selected ? '' : 'border-gray-600 text-white'
                    }`}
                    onClick={() =>
                      handleSetCourtesyDrink(product.id, product.name)
                    }
                  >
                    <div className="text-left w-full">
                      <div className="text-sm font-medium">{product.name}</div>
                      <div
                        className={`text-xs ${
                          product.isAlcoholic ? 'text-amber-400' : 'text-gray-400'
                        }`}
                      >
                        {product.isAlcoholic ? '🍺 Com álcool' : '🧊 Sem álcool'}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
            {courtesyItem && (
              <p className="text-xs text-green-400 mt-2">
                ✓ {courtesyItem.name} selecionada
              </p>
            )}
          </section>

          <Separator className="bg-gray-700" />

          {/* ---- Additional Products ---- */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              Produtos Adicionais
            </h2>

            {nonAlcoholicProducts.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm text-gray-400 mb-2">
                  Não Alcoólicos
                </h3>
                <div className="space-y-2">
                  {nonAlcoholicProducts.map((product) => {
                    const qty = getProductQuantity(product.id);
                    return (
                      <ProductRow
                        key={product.id}
                        name={product.name}
                        price={product.price}
                        quantity={qty}
                        onAdd={() =>
                          handleAddProduct(
                            product.id,
                            product.name,
                            product.price,
                            product.isAlcoholic
                          )
                        }
                        onRemove={() => handleRemoveProduct(product.id)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {alcoholicProducts.length > 0 && (
              <div>
                <h3 className="text-sm text-amber-400 mb-2">
                  🍺 Bebidas Alcóolicas
                </h3>
                <div className="space-y-2">
                  {alcoholicProducts.map((product) => {
                    const qty = getProductQuantity(product.id);
                    return (
                      <div
                        key={product.id}
                        className="border border-amber-900/30 rounded-lg"
                      >
                        <ProductRow
                          name={product.name}
                          price={product.price}
                          quantity={qty}
                          onAdd={() =>
                            handleAddProduct(
                              product.id,
                              product.name,
                              product.price,
                              product.isAlcoholic
                            )
                          }
                          onRemove={() => handleRemoveProduct(product.id)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {products.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">
                Nenhum produto disponível no momento.
              </p>
            )}
          </section>
        </div>
      </ScrollArea>

      {/* Fixed footer */}
      <div className="bg-black/50 border-t border-gray-700 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400">Total</span>
            <span className="text-2xl font-bold text-white">
              R$ {order.totalValue.toFixed(2)}
            </span>
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={handleConfirm}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Finalizar Pedido
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Product Row helper
// ---------------------------------------------------------------------------

function ProductRow({
  name,
  price,
  quantity,
  onAdd,
  onRemove,
}: {
  name: string;
  price: number;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
      <div className="flex-1 min-w-0">
        <span className="font-medium text-white text-sm">{name}</span>
        <span className="text-sm text-gray-400 ml-2">
          R$ {price.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-gray-600 text-white hover:bg-white/10"
          onClick={onRemove}
          disabled={quantity === 0}
          aria-label="Remover"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-6 text-center font-medium text-white text-sm">
          {quantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-gray-600 text-white hover:bg-white/10"
          onClick={onAdd}
          aria-label="Adicionar"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
