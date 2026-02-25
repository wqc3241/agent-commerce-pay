import { Minus, Plus, Trash2 } from 'lucide-react'
import type { CartItem } from '@/types'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'

interface CartSummaryProps {
  items: CartItem[]
  total: number
}

export function CartSummary({ items, total }: CartSummaryProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
      <h4 className="mb-3 text-sm font-semibold text-white">Your Cart</h4>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.product.id} className="flex items-center gap-3">
            <span className={/^\p{Emoji}/u.test(item.product.image) ? 'text-xl' : 'flex h-6 w-6 items-center justify-center rounded bg-zinc-700/50 text-xs'}>{item.product.image}</span>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm text-white">{item.product.name}</p>
              <p className="text-xs text-zinc-400">{formatPrice(item.product.price)}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-6 text-center text-sm text-white">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              >
                <Plus className="h-3 w-3" />
              </button>
              <button
                onClick={() => removeItem(item.product.id)}
                className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 hover:bg-red-900/30 hover:text-red-400"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-zinc-700 pt-3">
        <span className="text-sm text-zinc-400">Total</span>
        <span className="text-lg font-bold text-emerald-400">{formatPrice(total)}</span>
      </div>
    </div>
  )
}
