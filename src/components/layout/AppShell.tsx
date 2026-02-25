import { useState } from 'react'
import { Header } from './Header'
import { CartDrawer } from './CartDrawer'
import { ChatWindow } from '@/components/chat/ChatWindow'

export function AppShell() {
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <div className="flex h-dvh flex-col bg-zinc-950 text-white">
      <Header onCartClick={() => setCartOpen(true)} />
      <ChatWindow />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
