import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLoadingProgress } from '../hooks/useLoadingProgress'
import { Cloud, CheckCircle, AlertCircle } from 'lucide-react'

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default function LoadingProgress({ show = true }) {
  const { loaded, total, percent, status } = useLoadingProgress()
  const [visible, setVisible] = useState(false)

  // Show when loading, hide 1.5s after done
  useEffect(() => {
    if (status === 'loading') {
      setVisible(true)
    } else if (status === 'done') {
      const timer = setTimeout(() => setVisible(false), 1500)
      return () => clearTimeout(timer)
    } else if (status === 'idle' || status === 'cached') {
      setVisible(false)
    }
  }, [status])

  const isLoading = status === 'loading'
  const isDone = status === 'done'
  const isError = status === 'error'

  if (!show || !visible) {
    return null
  }

  return (
    <AnimatePresence>
      {(isLoading || isDone) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-80 max-w-[90vw]"
        >
          <div className="bg-white rounded-2xl shadow-soft-xl p-4 border border-warm-beige">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              {isLoading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Cloud className="w-5 h-5 text-primary" />
                </motion.div>
              )}
              {isDone && <CheckCircle className="w-5 h-5 text-green-500" />}
              {isError && <AlertCircle className="w-5 h-5 text-red-500" />}

              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">
                  {isLoading && '正在載入動物資料...'}
                  {isDone && '載入完成！'}
                  {isError && '載入失敗'}
                </p>
                {isLoading && total > 0 && (
                  <p className="text-xs text-text-light">
                    {formatBytes(loaded)} / {formatBytes(total)}
                  </p>
                )}
              </div>

              <span className="text-sm font-bold text-primary">
                {percent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-warm-beige rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>

            {/* Paw prints animation */}
            {isLoading && (
              <div className="flex justify-center gap-1 mt-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="text-xs"
                  >
                    🐾
                  </motion.span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Inline progress bar for embedding in pages
export function InlineProgress({ className = '' }) {
  const { loaded, total, percent, status } = useLoadingProgress()

  if (status !== 'loading') return null

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary flex items-center gap-2">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            🔄
          </motion.span>
          載入中...
        </span>
        <span className="text-primary font-medium">{percent}%</span>
      </div>
      <div className="h-2 bg-warm-beige rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      {total > 0 && (
        <p className="text-xs text-text-light text-center">
          已下載 {formatBytes(loaded)} / 約 {formatBytes(total)}
        </p>
      )}
    </div>
  )
}
