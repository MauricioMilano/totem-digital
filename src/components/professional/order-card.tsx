'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, User } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const productCount = order.items
    .filter((i) => i.type === 'product')
    .reduce((sum, i) => sum + i.quantity, 0);

  const serviceNames = order.items
    .filter((i) => i.type === 'service' && i.price > 0)
    .map((i) => i.name)
    .join(', ');

  const elapsedTime = formatDistanceToNow(new Date(order.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-lg flex items-center gap-2 truncate">
              <User className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{order.clientName}</span>
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {serviceNames || 'Sem serviço agendado'}
            </p>
          </div>
          <Badge
            variant={order.status === 'open' ? 'default' : 'secondary'}
            className="shrink-0 ml-2"
          >
            {order.status === 'open' ? 'Aberto' : 'Fechado'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{elapsedTime}</span>
          </div>
          <div className="text-right">
            {productCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {productCount} item(ns)
              </p>
            )}
            <p className="font-bold text-lg">
              R$ {order.totalValue.toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
