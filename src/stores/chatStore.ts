import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Message, RichContent } from '@/types'
import { processUserMessage } from '@/engine/agent'
import { processWithAI } from '@/engine/aiAgent'
import { isAIAvailable } from '@/engine/geminiClient'

interface ChatStore {
  messages: Message[]
  isTyping: boolean
  addUserMessage: (text: string) => void
  addAgentMessage: (text: string, richContent?: RichContent) => void
  setTyping: (typing: boolean) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isTyping: false,

  addUserMessage: (text) => {
    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    set((state) => ({ messages: [...state.messages, userMsg] }))

    // Trigger agent response
    get().setTyping(true)

    if (isAIAvailable()) {
      // Use AI-powered agent
      processWithAI(text).catch((error) => {
        console.error('AI agent failed, falling back to rule-based:', error)
        processUserMessage(text)
      })
    } else {
      // Fallback to rule-based agent with simulated delay
      const delay = 500 + Math.random() * 700
      setTimeout(() => {
        processUserMessage(text)
      }, delay)
    }
  },

  addAgentMessage: (text, richContent) => {
    const agentMsg: Message = {
      id: uuidv4(),
      role: 'agent',
      content: text,
      richContent,
      timestamp: new Date(),
    }
    set((state) => ({
      messages: [...state.messages, agentMsg],
      isTyping: false,
    }))
  },

  setTyping: (typing) => set({ isTyping: typing }),
}))
