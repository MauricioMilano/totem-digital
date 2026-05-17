'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { Order, OrderItem, OrderStatus } from '@/types';

// ---------------------------------------------------------------------------
// State & Reducer
// ---------------------------------------------------------------------------

type OrdersState = {
  orders: Record<string, Order>;
};

type OrderAction =
  | { type: 'CREATE_ORDER'; payload: Order }
  | { type: 'ADD_ITEM'; payload: { orderId: string; item: OrderItem } }
  | { type: 'REMOVE_ITEM'; payload: { orderId: string; itemId: string } }
  | {
      type: 'UPDATE_ITEM_QUANTITY';
      payload: { orderId: string; itemId: string; quantity: number };
    }
  | { type: 'SET_COURTESY_DRINK'; payload: { orderId: string; item: OrderItem } }
  | { type: 'UPDATE_STATUS'; payload: { orderId: string; status: OrderStatus } };

const STORAGE_KEY = 'barber-orders';

function orderReducer(state: OrdersState, action: OrderAction): OrdersState {
  switch (action.type) {
    case 'CREATE_ORDER': {
      return { orders: { ...state.orders, [action.payload.id]: action.payload } };
    }

    case 'ADD_ITEM': {
      const { orderId, item } = action.payload;
      const order = state.orders[orderId];
      if (!order) return state;

      const existingIndex = order.items.findIndex(
        (i) =>
          i.productId === item.productId &&
          i.type === item.type &&
          i.isCourtesy === item.isCourtesy
      );

      let newItems: OrderItem[];
      if (existingIndex >= 0) {
        newItems = order.items.map((i, idx) =>
          idx === existingIndex
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        newItems = [...order.items, item];
      }

      const totalValue = newItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      return {
        ...state,
        orders: {
          ...state.orders,
          [orderId]: {
            ...order,
            items: newItems,
            totalValue,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    case 'REMOVE_ITEM': {
      const { orderId, itemId } = action.payload;
      const order = state.orders[orderId];
      if (!order) return state;

      const newItems = order.items.filter((i) => i.id !== itemId);
      const totalValue = newItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      return {
        ...state,
        orders: {
          ...state.orders,
          [orderId]: {
            ...order,
            items: newItems,
            totalValue,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    case 'UPDATE_ITEM_QUANTITY': {
      const { orderId, itemId, quantity } = action.payload;
      const order = state.orders[orderId];
      if (!order) return state;

      // Remove item if quantity drops to zero or below
      if (quantity <= 0) {
        const newItems = order.items.filter((i) => i.id !== itemId);
        const totalValue = newItems.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );
        return {
          ...state,
          orders: {
            ...state.orders,
            [orderId]: {
              ...order,
              items: newItems,
              totalValue,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      }

      const newItems = order.items.map((i) =>
        i.id === itemId ? { ...i, quantity } : i
      );
      const totalValue = newItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      return {
        ...state,
        orders: {
          ...state.orders,
          [orderId]: {
            ...order,
            items: newItems,
            totalValue,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    case 'SET_COURTESY_DRINK': {
      const { orderId, item } = action.payload;
      const order = state.orders[orderId];
      if (!order) return state;

      // Remove any previous courtesy drink, then add the new one
      const withoutCourtesy = order.items.filter((i) => !i.isCourtesy);
      const newItems = [...withoutCourtesy, item];
      const totalValue = newItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      return {
        ...state,
        orders: {
          ...state.orders,
          [orderId]: {
            ...order,
            items: newItems,
            totalValue,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    case 'UPDATE_STATUS': {
      const { orderId, status } = action.payload;
      const order = state.orders[orderId];
      if (!order) return state;

      return {
        ...state,
        orders: {
          ...state.orders,
          [orderId]: {
            ...order,
            status,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

type OrderContextType = {
  orders: Record<string, Order>;
  createOrder: (
    clientId: string,
    clientName: string,
    serviceName: string,
    servicePrice: number
  ) => string;
  getOrder: (orderId: string) => Order | undefined;
  getClientOrder: (clientId: string) => Order | undefined;
  getActiveOrders: () => Order[];
  addItem: (orderId: string, item: Omit<OrderItem, 'id'>) => void;
  removeItem: (orderId: string, itemId: string) => void;
  updateItemQuantity: (
    orderId: string,
    itemId: string,
    quantity: number
  ) => void;
  setCourtesyDrink: (
    orderId: string,
    productId: string,
    name: string
  ) => void;
  closeOrder: (orderId: string) => void;
  reopenOrder: (orderId: string) => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(orderReducer, null, () => {
    // Load persisted state from localStorage synchronously on first render
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored) as OrdersState;
      } catch {
        /* ignore */
      }
    }
    return { orders: {} };
  });

  // Persist to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------

  const createOrder = useCallback(
    (
      clientId: string,
      clientName: string,
      serviceName: string,
      servicePrice: number
    ): string => {
      const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const now = new Date().toISOString();

      const serviceItem: OrderItem = {
        id: `item-${Date.now()}-srv`,
        name: serviceName,
        price: servicePrice,
        quantity: 1,
        type: 'service',
      };

      const order: Order = {
        id: orderId,
        clientId,
        clientName,
        items: [serviceItem],
        totalValue: servicePrice,
        status: 'open',
        createdAt: now,
        updatedAt: now,
      };

      dispatch({ type: 'CREATE_ORDER', payload: order });
      return orderId;
    },
    []
  );

  const getOrder = useCallback(
    (orderId: string): Order | undefined => state.orders[orderId],
    [state.orders]
  );

  const getClientOrder = useCallback(
    (clientId: string): Order | undefined =>
      Object.values(state.orders).find(
        (o) => o.clientId === clientId && o.status === 'open'
      ),
    [state.orders]
  );

  const getActiveOrders = useCallback(
    (): Order[] =>
      Object.values(state.orders).filter((o) => o.status === 'open'),
    [state.orders]
  );

  const addItem = useCallback(
    (orderId: string, item: Omit<OrderItem, 'id'>) => {
      const fullItem: OrderItem = {
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      };
      dispatch({ type: 'ADD_ITEM', payload: { orderId, item: fullItem } });
    },
    []
  );

  const removeItem = useCallback((orderId: string, itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { orderId, itemId } });
  }, []);

  const updateItemQuantity = useCallback(
    (orderId: string, itemId: string, quantity: number) => {
      dispatch({
        type: 'UPDATE_ITEM_QUANTITY',
        payload: { orderId, itemId, quantity },
      });
    },
    []
  );

  const setCourtesyDrink = useCallback(
    (orderId: string, productId: string, name: string) => {
      const item: OrderItem = {
        id: `item-${Date.now()}-courtesy`,
        name,
        price: 0, // courtesy drinks are free
        quantity: 1,
        type: 'product',
        productId,
        isCourtesy: true,
      };
      dispatch({ type: 'SET_COURTESY_DRINK', payload: { orderId, item } });
    },
    []
  );

  const closeOrder = useCallback((orderId: string) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { orderId, status: 'closed' } });
  }, []);

  const reopenOrder = useCallback((orderId: string) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { orderId, status: 'open' } });
  }, []);

  // -----------------------------------------------------------------------
  // Memoized context value
  // -----------------------------------------------------------------------

  const value = useMemo(
    () => ({
      orders: state.orders,
      createOrder,
      getOrder,
      getClientOrder,
      getActiveOrders,
      addItem,
      removeItem,
      updateItemQuantity,
      setCourtesyDrink,
      closeOrder,
      reopenOrder,
    }),
    [
      state.orders,
      createOrder,
      getOrder,
      getClientOrder,
      getActiveOrders,
      addItem,
      removeItem,
      updateItemQuantity,
      setCourtesyDrink,
      closeOrder,
      reopenOrder,
    ]
  );

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
