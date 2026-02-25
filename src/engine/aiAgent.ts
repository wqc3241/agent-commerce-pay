import type { GeminiContent, GeminiPart, GeminiToolConfig } from './geminiClient'
import { sendMessage } from './geminiClient'
import { resolveProductUrls } from './tavilyClient'
import { useCartStore } from '@/stores/cartStore'
import { useOrderStore } from '@/stores/orderStore'
import { useChatStore } from '@/stores/chatStore'
import { formatPrice } from '@/lib/utils'
import type { Product, RichContent } from '@/types'

// Conversation history for multi-turn context (separate from UI messages)
const conversationHistory: GeminiContent[] = []

// Track last search results so the model can reference them by index
let lastSearchResults: Product[] = []

const SYSTEM_PROMPT = `You are a friendly shopping assistant for AgentPay, an AI-powered e-commerce store.
You help users find products, manage their cart, and complete purchases.

Guidelines:
- Be concise and helpful. Keep responses to 1-3 sentences.
- When users ask to find/search for products, use the search_products function. You MUST include specific product recommendations in the "products" array — use real product names with brand names (e.g., "JBL Vibe Buds True Wireless Earbuds") and accurate approximate prices. Recommend 3-5 products.
- When users want to add something to cart, use add_to_cart. If they say "add the first one" or "add #2", refer to the last search results by index (0-based).
- When users ask about their cart, use view_cart.
- When users want to checkout, use checkout.
- Always confirm actions with the user (e.g., "Added X to your cart!").
- If a search returns no results, suggest broadening the search terms.
- Be natural and conversational, not robotic.`

const TOOLS: GeminiToolConfig[] = [
  {
    functionDeclarations: [
      {
        name: 'search_products',
        description:
          'Search for products on the web. Use this when the user wants to find, browse, or look for products. You must return a JSON array of specific product recommendations in the "products" field.',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description:
                'The search query for products (e.g., "wireless earbuds under $50")',
            },
            products: {
              type: 'array',
              description:
                'Your recommended products. Provide 3-5 specific, real products with accurate names and prices.',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Full product name including brand (e.g., "JBL Vibe Buds True Wireless Earbuds")',
                  },
                  price: {
                    type: 'number',
                    description: 'Approximate price in USD (e.g., 29.99). Use 0 if unknown.',
                  },
                  description: {
                    type: 'string',
                    description: 'One sentence product description',
                  },
                  category: {
                    type: 'string',
                    description: 'Product category (e.g., Audio, Electronics, Home, Clothing)',
                  },
                },
                required: ['name'],
              },
            },
          },
          required: ['query', 'products'],
        },
      },
      {
        name: 'add_to_cart',
        description:
          'Add a product to the shopping cart. Use the product index from the last search results (0-based) or provide product details directly.',
        parameters: {
          type: 'object',
          properties: {
            product_index: {
              type: 'number',
              description:
                'Index of the product from the last search results (0-based). E.g., 0 for the first result.',
            },
            product_name: {
              type: 'string',
              description:
                'Name of the product to add (used as fallback if index is not available)',
            },
          },
        },
      },
      {
        name: 'view_cart',
        description: 'View the current contents of the shopping cart.',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'checkout',
        description: 'Process checkout and place an order with the current cart items.',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    ],
  },
]

function getCartContext(): string {
  const cart = useCartStore.getState()
  const items = cart.items
  if (items.length === 0) return '\nCurrent cart: empty'
  const itemList = items
    .map((i) => `- ${i.product.name} x${i.quantity} (${formatPrice(i.product.price)} each)`)
    .join('\n')
  return `\nCurrent cart (${cart.getItemCount()} items, total ${formatPrice(cart.getTotal())}):\n${itemList}`
}

function getSearchContext(): string {
  if (lastSearchResults.length === 0) return ''
  const items = lastSearchResults
    .map(
      (p, i) =>
        `${i}: ${p.name} - ${p.price > 0 ? formatPrice(p.price) : 'Price N/A'}`
    )
    .join('\n')
  return `\nLast search results:\n${items}`
}

async function executeTool(
  toolName: string,
  input: Record<string, unknown>
): Promise<{ result: string; richContent?: RichContent }> {
  const cart = useCartStore.getState()

  switch (toolName) {
    case 'search_products': {
      const rawProducts = (input.products as { name: string; price?: number; description?: string; category?: string }[]) || []

      if (rawProducts.length === 0) {
        return { result: 'No product recommendations provided. Please suggest specific products.' }
      }

      // Gemini provided product names → Tavily resolves direct purchase URLs
      const products = await resolveProductUrls(
        rawProducts.map((p) => ({
          name: p.name,
          price: p.price || 0,
          description: p.description || '',
          category: p.category || 'General',
        }))
      )
      lastSearchResults = products

      const summary = products
        .map(
          (p, i) =>
            `${i}: ${p.name} - ${p.price > 0 ? formatPrice(p.price) : 'Price N/A'}${p.url ? ` (${p.url})` : ''}`
        )
        .join('\n')

      return {
        result: `Found ${products.length} products with direct purchase links:\n${summary}`,
        richContent: { type: 'products', products },
      }
    }

    case 'add_to_cart': {
      const index = input.product_index as number | undefined
      const name = input.product_name as string | undefined

      let product: Product | undefined

      if (index !== undefined && index >= 0 && index < lastSearchResults.length) {
        product = lastSearchResults[index]
      } else if (name) {
        product = lastSearchResults.find((p) =>
          p.name.toLowerCase().includes(name.toLowerCase())
        )
        if (!product) {
          const cartItem = cart.items.find((i) =>
            i.product.name.toLowerCase().includes(name.toLowerCase())
          )
          if (cartItem) product = cartItem.product
        }
      }

      if (!product) {
        return {
          result: `Could not find the product to add. Available products from last search: ${lastSearchResults.map((p, i) => `${i}: ${p.name}`).join(', ') || 'none (try searching first)'}`,
        }
      }

      cart.addItem(product)
      return {
        result: `Added "${product.name}" (${product.price > 0 ? formatPrice(product.price) : 'Price N/A'}) to cart. Cart now has ${useCartStore.getState().getItemCount()} item(s).`,
      }
    }

    case 'view_cart': {
      const items = cart.items
      if (items.length === 0) {
        return { result: 'The cart is empty.' }
      }

      const summary = items
        .map(
          (i) =>
            `- ${i.product.name} x${i.quantity} = ${formatPrice(i.product.price * i.quantity)}`
        )
        .join('\n')

      return {
        result: `Cart contents:\n${summary}\nTotal: ${formatPrice(cart.getTotal())}`,
        richContent: { type: 'cart', items, total: cart.getTotal() },
      }
    }

    case 'checkout': {
      const items = cart.items
      if (items.length === 0) {
        return { result: 'Cannot checkout — the cart is empty.' }
      }

      const total = cart.getTotal()
      const order = useOrderStore.getState().placeOrder(items, total)
      useCartStore.getState().clearCart()

      return {
        result: `Order placed successfully! Order ID: ${order.id}, Total: ${formatPrice(total)}`,
        richContent: { type: 'order', order },
      }
    }

    default:
      return { result: `Unknown tool: ${toolName}` }
  }
}

function extractFunctionCalls(
  parts: GeminiPart[]
): { name: string; args: Record<string, unknown> }[] {
  const calls: { name: string; args: Record<string, unknown> }[] = []
  for (const part of parts) {
    if ('functionCall' in part) {
      calls.push(part.functionCall)
    }
  }
  return calls
}

function extractText(parts: GeminiPart[]): string {
  const texts: string[] = []
  for (const part of parts) {
    if ('text' in part) {
      texts.push(part.text)
    }
  }
  return texts.join('\n')
}

export async function processWithAI(userText: string): Promise<void> {
  const addAgentMessage = useChatStore.getState().addAgentMessage

  conversationHistory.push({ role: 'user', parts: [{ text: userText }] })

  const systemWithContext = SYSTEM_PROMPT + getCartContext() + getSearchContext()

  let pendingRichContent: RichContent | undefined
  let iterations = 0
  const MAX_ITERATIONS = 5

  try {
    while (iterations < MAX_ITERATIONS) {
      iterations++

      const response = await sendMessage(conversationHistory, systemWithContext, TOOLS)

      const candidate = response.candidates?.[0]
      if (!candidate) {
        throw new Error('No response candidate from Gemini')
      }

      const parts = candidate.content.parts
      const functionCalls = extractFunctionCalls(parts)
      const textContent = extractText(parts)

      if (functionCalls.length === 0) {
        const finalText =
          textContent || "I'm here to help! Try asking me to search for products."
        conversationHistory.push({ role: 'model', parts: candidate.content.parts })
        addAgentMessage(finalText, pendingRichContent)
        return
      }

      conversationHistory.push({ role: 'model', parts: candidate.content.parts })

      const functionResponseParts: GeminiPart[] = []

      for (const call of functionCalls) {
        const { result, richContent } = await executeTool(call.name, call.args)

        if (richContent) {
          pendingRichContent = richContent
        }

        functionResponseParts.push({
          functionResponse: {
            name: call.name,
            response: { result },
          },
        })
      }

      conversationHistory.push({ role: 'user', parts: functionResponseParts })
    }

    addAgentMessage(
      "I've completed the action. Let me know if you need anything else!",
      pendingRichContent
    )
  } catch (error) {
    console.error('AI Agent error:', error)
    throw error
  }
}
