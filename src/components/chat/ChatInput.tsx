import { useState, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { useChatStore } from '@/stores/chatStore'

export function ChatInput() {
  const [text, setText] = useState('')
  const addUserMessage = useChatStore((s) => s.addUserMessage)
  const isTyping = useChatStore((s) => s.isTyping)

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return
    addUserMessage(trimmed)
    setText('')
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-zinc-800 bg-zinc-950 p-4">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... try 'show products' or 'help'"
          disabled={isTyping}
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-blue-500 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || isTyping}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
