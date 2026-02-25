import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'
import { useChatStore } from '@/stores/chatStore'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const total = useCartStore((s) => s.getTotal())
  const addUserMessage = useChatStore((s) => s.addUserMessage)

  const handleCheckout = () => {
    onClose()
    addUserMessage('checkout')
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-950"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Shopping Cart</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-zinc-500">
                  <ShoppingBag className="h-12 w-12" />
                  <p className="text-sm">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3"
                    >
                      <span className={/^\p{Emoji}/u.test(item.product.image) ? 'text-3xl' : 'flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-lg'}>{item.product.image}</span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-emerald-400">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="ml-1 flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-red-900/30 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={clearCart}
                    className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    Clear cart
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-zinc-800 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-zinc-400">Total</span>
                  <span className="text-xl font-bold text-emerald-400">{formatPrice(total)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
