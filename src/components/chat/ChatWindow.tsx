import { useEffect, useRef } from 'react'
import { useChatStore } from '@/stores/chatStore'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'

export function ChatWindow() {
  const messages = useChatStore((s) => s.messages)
  const isTyping = useChatStore((s) => s.isTyping)
  const addAgentMessage = useChatStore((s) => s.addAgentMessage)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasGreeted = useRef(false)

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Initial greeting
  useEffect(() => {
    if (hasGreeted.current) return
    hasGreeted.current = true
    setTimeout(() => {
      addAgentMessage(
        "Welcome to AgentPay! 👋 I'm your AI shopping assistant. I can help you browse products, manage your cart, and checkout — all through this chat.\n\nTry saying **\"show me products\"** or **\"help\"** to get started!"
      )
    }, 600)
  }, [addAgentMessage])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4">
        <div className="mx-auto max-w-3xl space-y-1">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      </div>

      {/* Input */}
      <ChatInput />
    </div>
  )
}
