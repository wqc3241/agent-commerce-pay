import { CheckCircle } from 'lucide-react'
import type { Order } from '@/types'
import { formatPrice } from '@/lib/utils'
import { format } from 'date-fns'

interface OrderConfirmationProps {
  order: Order
}

export function OrderConfirmation({ order }: OrderConfirmationProps) {
  return (
    <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/30 p-4">
      <div className="mb-3 flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-emerald-400" />
        <h4 className="text-sm font-semibold text-emerald-400">Order Confirmed!</h4>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-400">Order ID</span>
          <span className="font-mono text-white">#{order.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Status</span>
          <span className="capitalize text-emerald-400">{order.status}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Date</span>
          <span className="text-white">{format(order.createdAt, 'MMM d, yyyy h:mm a')}</span>
        </div>
        <div className="border-t border-zinc-700/50 pt-2">
          {order.items.map((item) => (
            <div key={item.product.id} className="flex justify-between py-0.5">
              <span className="text-zinc-300">
                {item.product.image} {item.product.name} x{item.quantity}
              </span>
              <span className="text-zinc-300">
                {formatPrice(item.product.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-zinc-700/50 pt-2">
          <span className="font-semibold text-white">Total</span>
          <span className="font-bold text-emerald-400">{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  )
}
