'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Order } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CreditCard,
  Repeat,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  User,
} from 'lucide-react';

type PaymentStep = 'idle' | 'processing' | 'success' | 'error';

interface OrderDetailModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onCloseOrder: (orderId: string) => void;
  onReopenOrder: (orderId: string) => void;
}

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onCloseOrder,
  onReopenOrder,
}: OrderDetailModalProps) {
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('idle');

  const handleCloseOrder = useCallback(() => {
    setPaymentStep('processing');

    // Simulate Stone payment terminal integration
    setTimeout(() => {
      // 85 % success rate for demo purposes
      const success = Math.random() > 0.15;
      if (success) {
        setPaymentStep('success');
        setTimeout(() => {
          onCloseOrder(order.id);
          onClose();
          setTimeout(() => setPaymentStep('idle'), 300);
        }, 1500);
      } else {
        setPaymentStep('error');
      }
    }, 2500);
  }, [order.id, onCloseOrder, onClose]);

  const handleReopen = useCallback(() => {
    onReopenOrder(order.id);
    onClose();
  }, [order.id, onReopenOrder, onClose]);

  const handleRetryPayment = useCallback(() => {
    setPaymentStep('idle');
  }, []);

  // ---------- Derived data ----------
  const services = order.items.filter((i) => i.type === 'service');
  const products = order.items.filter(
    (i) => i.type === 'product' && !i.isCourtesy
  );
  const courtesyDrink = order.items.find((i) => i.isCourtesy);

  const elapsedTime = formatDistanceToNow(new Date(order.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && paymentStep !== 'processing') {
          onClose();
          setPaymentStep('idle');
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">{order.clientName}</DialogTitle>
              <DialogDescription>
                Pedido aberto {elapsedTime}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status & ID */}
          <div className="flex items-center gap-2">
            <Badge
              variant={order.status === 'open' ? 'default' : 'secondary'}
            >
              {order.status === 'open' ? 'Aberto' : 'Fechado'}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              #{order.id.slice(-6)}
            </span>
          </div>

          {/* Services */}
          {services.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Serviços
              </h4>
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between text-sm py-0.5"
                  >
                    <span>{s.name}</span>
                    {s.price > 0 && (
                      <span className="font-medium">
                        R$ {s.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Courtesy drink */}
          {courtesyDrink && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Bebida Cortesia
              </h4>
              <div className="flex justify-between text-sm py-1">
                <span>{courtesyDrink.name}</span>
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-200 bg-green-50"
                >
                  Grátis
                </Badge>
              </div>
            </div>
          )}

          {/* Additional products */}
          {products.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Produtos Adicionais
              </h4>
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between text-sm py-0.5"
                  >
                    <span>
                      {p.name}{' '}
                      <span className="text-muted-foreground">
                        x{p.quantity}
                      </span>
                    </span>
                    <span className="font-medium">
                      R$ {(p.price * p.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Total */}
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span className="text-lg">
              R$ {order.totalValue.toFixed(2)}
            </span>
          </div>

          {/* ---------- Payment simulation ---------- */}
          {paymentStep === 'processing' && (
            <div className="flex flex-col items-center gap-3 py-6 bg-muted/30 rounded-lg">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Conectando à maquininha Stone...
              </p>
              <p className="text-xs text-muted-foreground">
                Aproxime o cartão ou insira a senha
              </p>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="flex flex-col items-center gap-3 py-6 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <p className="text-sm text-green-700 font-medium">
                Pagamento aprovado!
              </p>
              <p className="text-xs text-green-600">
                Comanda fechada com sucesso
              </p>
            </div>
          )}

          {paymentStep === 'error' && (
            <div className="flex flex-col items-center gap-3 py-6 bg-red-50 rounded-lg border border-red-200">
              <XCircle className="h-10 w-10 text-red-500" />
              <p className="text-sm text-red-700 font-medium">
                Falha na comunicação com a maquininha
              </p>
              <p className="text-xs text-red-600">
                Verifique a conexão e tente novamente
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryPayment}
              >
                Tentar novamente
              </Button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {paymentStep === 'idle' && (
          <div className="flex gap-2 justify-end mt-2">
            {order.status === 'closed' ? (
              <Button onClick={handleReopen} variant="outline">
                <Repeat className="mr-2 h-4 w-4" />
                Reabrir Comanda
              </Button>
            ) : (
              <Button
                onClick={handleCloseOrder}
                className="bg-green-600 hover:bg-green-700"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Fechar Comanda
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
