import { motion } from 'framer-motion'

export function PaymentProcessing() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-6">
      <motion.div
        className="h-10 w-10 rounded-full border-3 border-zinc-600 border-t-blue-500"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <div className="text-center">
        <p className="text-sm font-medium text-white">Processing payment...</p>
        <p className="mt-1 text-xs text-zinc-400">Please wait a moment</p>
      </div>
    </div>
  )
}
