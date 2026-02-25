import type { AgentIntent, Product } from '@/types'
import { products } from '@/data/products'
import { useCartStore } from '@/stores/cartStore'
import { useOrderStore } from '@/stores/orderStore'
import { useChatStore } from '@/stores/chatStore'
import { formatPrice } from '@/lib/utils'

function parseIntent(text: string): { intent: AgentIntent; query: string } {
  const lower = text.toLowerCase().trim()

  if (/^(hi|hello|hey|howdy|yo|sup|greetings)\b/.test(lower)) {
    return { intent: 'greeting', query: '' }
  }

  if (/\b(help|what can you do|capabilities|commands)\b/.test(lower)) {
    return { intent: 'help', query: '' }
  }

  if (/\b(checkout|pay\b|purchase|buy now|place order)\b/.test(lower)) {
    return { intent: 'checkout', query: '' }
  }

  if (/\b(my cart|view cart|show cart|what'?s in my cart|cart items)\b/.test(lower)) {
    return { intent: 'view_cart', query: '' }
  }

  if (/\b(order|status|tracking|my orders)\b/.test(lower)) {
    return { intent: 'order_status', query: '' }
  }

  if (/\badd\b/.test(lower)) {
    const query = lower.replace(/\badd\b/, '').replace(/\bto\s*(my\s*)?cart\b/, '').trim()
    return { intent: 'add_to_cart', query }
  }

  if (/\b(search|find|look for|looking for)\b/.test(lower)) {
    const query = lower
      .replace(/\b(search|find|look for|looking for)\b/, '')
      .replace(/\bfor\b/, '')
      .trim()
    return { intent: 'search', query }
  }

  if (/\b(browse|show|products|shop|catalog|what do you have|categories|all items)\b/.test(lower)) {
    // Check if it's a category-specific browse
    const categoryMatch = lower.match(/\b(electronics|clothing|food|grocery|home)\b/)
    return { intent: 'browse', query: categoryMatch ? categoryMatch[1] : '' }
  }

  return { intent: 'unknown', query: '' }
}

function findProducts(query: string): Product[] {
  if (!query) return products

  const lower = query.toLowerCase()
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.category.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower)
  )
}

function findBestProductMatch(query: string): Product | null {
  if (!query) return null

  const lower = query.toLowerCase()

  // Exact name match first
  const exact = products.find((p) => p.name.toLowerCase() === lower)
  if (exact) return exact

  // Partial name match
  const partial = products.find((p) => p.name.toLowerCase().includes(lower))
  if (partial) return partial

  // Word-by-word match
  const words = lower.split(/\s+/).filter((w) => w.length > 2)
  for (const product of products) {
    const pName = product.name.toLowerCase()
    if (words.some((w) => pName.includes(w))) return product
  }

  return null
}

export function processUserMessage(text: string) {
  const { intent, query } = parseIntent(text)
  const addAgentMessage = useChatStore.getState().addAgentMessage
  const cart = useCartStore.getState()
  const orderStore = useOrderStore.getState()

  switch (intent) {
    case 'greeting': {
      addAgentMessage(
        "Welcome to AgentPay! 👋 I'm your AI shopping assistant. I can help you browse products, add items to your cart, and checkout. Try saying **\"show me products\"** or **\"help\"** to see what I can do!"
      )
      break
    }

    case 'help': {
      addAgentMessage(
        "Here's what I can help you with:\n\n" +
        '• **"show products"** — Browse our full catalog\n' +
        '• **"find [item]"** — Search for specific products\n' +
        '• **"add [product name]"** — Add an item to your cart\n' +
        '• **"my cart"** — View your cart\n' +
        '• **"checkout"** — Complete your purchase\n' +
        '• **"order status"** — Check your orders\n\n' +
        'Just type naturally — I\'ll understand!'
      )
      break
    }

    case 'browse': {
      const results = query ? findProducts(query) : products
      if (results.length === 0) {
        addAgentMessage(
          `I couldn't find any products matching "${query}". Try **"show products"** to see our full catalog.`
        )
      } else {
        const label = query ? `Here's what I found for "${query}"` : "Here's our product catalog"
        addAgentMessage(
          `${label} — **${results.length} items** available. Click the + button to add any item to your cart!`,
          { type: 'products', products: results }
        )
      }
      break
    }

    case 'search': {
      const results = findProducts(query)
      if (results.length === 0) {
        addAgentMessage(
          `I couldn't find anything matching "${query}". Try browsing our full catalog with **"show products"**.`
        )
      } else {
        addAgentMessage(
          `I found **${results.length} item${results.length > 1 ? 's' : ''}** matching "${query}":`,
          { type: 'products', products: results }
        )
      }
      break
    }

    case 'add_to_cart': {
      const product = findBestProductMatch(query)
      if (!product) {
        addAgentMessage(
          `I couldn't find a product matching "${query}". Try **"show products"** to see what's available.`
        )
      } else {
        cart.addItem(product)
        addAgentMessage(
          `Added **${product.name}** (${formatPrice(product.price)}) to your cart! ${product.image}\n\nYour cart now has **${useCartStore.getState().getItemCount()} item(s)**. Say **"my cart"** to review or **"checkout"** when ready.`
        )
      }
      break
    }

    case 'view_cart': {
      const items = cart.items
      if (items.length === 0) {
        addAgentMessage(
          "Your cart is empty! Try **\"show products\"** to browse our catalog and find something you like."
        )
      } else {
        addAgentMessage("Here's what's in your cart:", {
          type: 'cart',
          items,
          total: cart.getTotal(),
        })
      }
      break
    }

    case 'checkout': {
      const items = cart.items
      if (items.length === 0) {
        addAgentMessage(
          "Your cart is empty — nothing to checkout! Try **\"show products\"** to add some items first."
        )
        break
      }

      const total = cart.getTotal()

      // Show processing animation
      addAgentMessage('Processing your payment...', { type: 'processing' })

      // After delay, show order confirmation
      setTimeout(() => {
        const order = useOrderStore.getState().placeOrder(items, total)
        useCartStore.getState().clearCart()
        useChatStore.getState().addAgentMessage(
          `Payment successful! Your order has been confirmed. 🎉`,
          { type: 'order', order }
        )
      }, 2500)
      break
    }

    case 'order_status': {
      const orders = orderStore.orders
      if (orders.length === 0) {
        addAgentMessage(
          "You don't have any orders yet. Start shopping by saying **\"show products\"**!"
        )
      } else {
        const latest = orders[0]
        addAgentMessage(
          `You have **${orders.length} order(s)**. Here's your most recent:`,
          { type: 'order', order: latest }
        )
      }
      break
    }

    case 'unknown':
    default: {
      addAgentMessage(
        "I'm not sure I understood that. Here are some things you can try:\n\n" +
        '• **"show products"** — Browse our catalog\n' +
        '• **"find headphones"** — Search for items\n' +
        '• **"add [product]"** — Add to cart\n' +
        '• **"checkout"** — Complete purchase\n' +
        '• **"help"** — See all commands'
      )
      break
    }
  }
}
