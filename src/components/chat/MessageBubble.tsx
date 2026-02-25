import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'
import { ProductGrid } from '@/components/commerce/ProductGrid'
import { CartSummary } from '@/components/commerce/CartSummary'
import { OrderConfirmation } from '@/components/commerce/OrderConfirmation'
import { PaymentProcessing } from '@/components/commerce/PaymentProcessing'

interface MessageBubbleProps {
  message: Message
}

function renderMarkdown(text: string) {
  // Simple bold markdown rendering
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function RichContentRenderer({ richContent }: { richContent: NonNullable<Message['richContent']> }) {
  switch (richContent.type) {
    case 'products':
      return <ProductGrid products={richContent.products} />
    case 'cart':
      return <CartSummary items={richContent.items} total={richContent.total} />
    case 'order':
      return <OrderConfirmation order={richContent.order} />
    case 'processing':
      return <PaymentProcessing />
    default:
      return null
  }
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex items-start gap-3 px-4 py-2', isUser && 'flex-row-reverse')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
          isUser
            ? 'bg-gradient-to-br from-emerald-400 to-cyan-500'
            : 'bg-gradient-to-br from-blue-500 to-purple-600'
        )}
      >
        {isUser ? 'U' : 'AI'}
      </div>

      {/* Content */}
      <div className={cn('flex max-w-[80%] flex-col gap-2', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line',
            isUser
              ? 'rounded-tr-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'rounded-tl-sm bg-zinc-800 text-zinc-200'
          )}
        >
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {renderMarkdown(line)}
            </span>
          ))}
        </div>

        {message.richContent && (
          <div className="w-full">
            <RichContentRenderer richContent={message.richContent} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
