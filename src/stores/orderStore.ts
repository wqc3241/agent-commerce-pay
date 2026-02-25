import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { CartItem, Order } from '@/types'

interface OrderStore {
  orders: Order[]
  placeOrder: (items: CartItem[], total: number) => Order
  getOrder: (id: string) => Order | undefined
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],

  placeOrder: (items, total) => {
    const order: Order = {
      id: uuidv4().slice(0, 8).toUpperCase(),
      items: [...items],
      total,
      status: 'confirmed',
      createdAt: new Date(),
    }
    set((state) => ({ orders: [order, ...state.orders] }))
    return order
  },

  getOrder: (id) => {
    return get().orders.find((o) => o.id === id)
  },
}))
