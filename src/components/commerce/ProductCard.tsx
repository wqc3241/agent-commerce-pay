import { Plus, ExternalLink } from 'lucide-react'
import type { Product } from '@/types'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
}

const isEmoji = (str: string) => /^\p{Emoji}/u.test(str)

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)

  const handleAdd = () => {
    addItem(product)
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-3 transition-colors hover:border-zinc-600">
      <div className="flex items-center justify-between">
        {isEmoji(product.image) ? (
          <span className="text-2xl">{product.image}</span>
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-700/50 text-sm">
            {product.image}
          </span>
        )}
        <span className="rounded-full bg-zinc-700/50 px-2 py-0.5 text-[10px] text-zinc-400">
          {product.category}
        </span>
      </div>
      <div>
        <h4 className="text-sm font-medium text-white">{product.name}</h4>
        <p className="mt-0.5 text-xs text-zinc-400 line-clamp-2">{product.description}</p>
      </div>
      <div className="mt-auto flex items-center justify-between pt-1">
        <span className="text-sm font-semibold text-emerald-400">
          {product.price > 0 ? formatPrice(product.price) : 'Price N/A'}
        </span>
        <div className="flex items-center gap-1.5">
          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-700 text-zinc-300 transition-colors hover:bg-zinc-600 hover:text-white"
              title="View product"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <button
            onClick={handleAdd}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
