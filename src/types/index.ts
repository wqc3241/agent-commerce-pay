export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  inStock: boolean
  url?: string
  source?: 'mock' | 'web'
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  status: 'processing' | 'confirmed' | 'delivered'
  createdAt: Date
}

export type RichContent =
  | { type: 'products'; products: Product[] }
  | { type: 'cart'; items: CartItem[]; total: number }
  | { type: 'order'; order: Order }
  | { type: 'processing' }

export interface Message {
  id: string
  role: 'user' | 'agent'
  content: string
  richContent?: RichContent
  timestamp: Date
}

export type AgentIntent =
  | 'greeting'
  | 'browse'
  | 'search'
  | 'add_to_cart'
  | 'view_cart'
  | 'checkout'
  | 'order_status'
  | 'help'
  | 'unknown'
