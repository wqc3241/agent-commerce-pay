import { ShoppingCart, Sparkles } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'

interface HeaderProps {
  onCartClick: () => void
}

export function Header({ onCartClick }: HeaderProps) {
  const itemCount = useCartStore((s) => s.getItemCount())

  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-400" />
        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-lg font-bold text-transparent">
          AgentPay
        </span>
      </div>
      <button
        onClick={onCartClick}
        className="relative flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
      >
        <ShoppingCart className="h-4 w-4" />
        <span className="text-sm">Cart</span>
        {itemCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-[10px] font-bold text-white">
            {itemCount}
          </span>
        )}
      </button>
    </header>
  )
}
