import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Share2, RotateCcw, Heart, Star } from 'lucide-react'
import { Button, Badge } from './ui'
import { getProxiedImageUrl } from '../services/api'

const defaultImage = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop'

export default function FortuneCard({ fortune, onDraw, isDrawn, isLoading, onViewAnimal }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isDrawn && fortune) {
      setTimeout(() => setIsFlipped(true), 500)
      setTimeout(() => setShowConfetti(true), 1200)
    }
  }, [isDrawn, fortune])

  const handleDraw = () => {
    setIsFlipped(false)
    setShowConfetti(false)
    onDraw()
  }

  const handleShare = async () => {
    const shareText = `🎋 今日幸運毛孩 🎋\n\n${fortune.fortune.type}！\n「${fortune.poem}」\n\n${fortune.fortune.message}\n\n快來浪浪找家抽個籤吧！`

    if (navigator.share) {
      try {
        await navigator.share({
          title: '浪浪找家 - 今日幸運毛孩',
          text: shareText,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      await navigator.clipboard.writeText(shareText)
      alert('已複製到剪貼簿！')
    }
  }

  return (
    <div className="relative max-w-md mx-auto">
      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  y: -20,
                  x: Math.random() * 300 - 150,
                  scale: 0,
                }}
                animate={{
                  opacity: 0,
                  y: 400,
                  x: Math.random() * 300 - 150,
                  scale: 1,
                  rotate: Math.random() * 720,
                }}
                transition={{
                  duration: 2 + Math.random(),
                  delay: Math.random() * 0.5,
                }}
                className="absolute top-0 left-1/2"
              >
                {['✨', '🌟', '💫', '⭐', '🎉'][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Card */}
      <div className="flip-card h-[500px] perspective-1000" style={{ perspective: '1000px' }}>
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          {/* Front - Draw Card */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/20 via-white to-secondary/20 rounded-3xl shadow-soft-xl p-8 flex flex-col items-center justify-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-8"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center shadow-glow">
                <Sparkles className="w-16 h-16 text-white" />
              </div>
            </motion.div>

            <h2 className="text-2xl font-display font-bold text-text-primary mb-4 text-center">
              今日幸運毛孩
            </h2>

            <p className="text-text-secondary text-center mb-8 max-w-xs">
              每天一次機會，抽取與你最有緣的毛孩，看看今天會遇見誰！
            </p>

            <Button
              variant="primary"
              size="lg"
              icon={Sparkles}
              onClick={handleDraw}
              loading={isLoading}
              className="shadow-glow"
            >
              {isLoading ? '抽籤中...' : '開始抽籤'}
            </Button>

            <p className="mt-4 text-sm text-text-light">
              每日 0:00 重置抽籤機會
            </p>
          </div>

          {/* Back - Result Card */}
          <div
            className="absolute inset-0 rounded-3xl shadow-soft-xl overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {fortune && (
              <div className="h-full flex flex-col">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getProxiedImageUrl(fortune.animal?.album_file) || defaultImage}
                    alt="幸運毛孩"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = defaultImage
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Fortune Type Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge
                      variant="primary"
                      size="lg"
                      className="bg-white/90 backdrop-blur-sm"
                    >
                      <Star className="w-4 h-4 fill-current" />
                      {fortune.fortune.type}
                    </Badge>
                  </div>

                  {/* Animal Type */}
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-2xl">
                      {fortune.animal?.animal_kind === '狗' ? '🐕' : '🐈'}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div
                  className="flex-1 p-6 flex flex-col"
                  style={{ backgroundColor: fortune.fortune.color + '20' }}
                >
                  {/* Poem */}
                  <div className="text-center mb-4">
                    <p className="text-lg font-display text-text-primary italic">
                      「{fortune.poem}」
                    </p>
                  </div>

                  {/* Fortune Message */}
                  <div className="bg-white/70 rounded-2xl p-4 mb-4">
                    <p className="text-text-secondary text-center">
                      {fortune.fortune.message}
                    </p>
                  </div>

                  {/* Animal Info */}
                  <div className="text-center text-sm text-text-secondary mb-4">
                    <p>
                      {fortune.animal?.animal_kind} #{fortune.animal?.animal_id}
                    </p>
                    <p className="text-xs mt-1">
                      {fortune.animal?.shelter_name}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto flex gap-3">
                    <Button
                      variant="primary"
                      className="flex-1"
                      icon={Heart}
                      onClick={() => onViewAnimal?.(fortune.animal)}
                    >
                      了解更多
                    </Button>
                    <Button
                      variant="outline"
                      icon={Share2}
                      onClick={handleShare}
                    >
                      分享
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Already Drawn State */}
      {isDrawn && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <p className="text-text-secondary mb-3">
            今天已經抽過籤囉！明天再來試試運氣吧 ✨
          </p>
          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={() => {
              setIsFlipped(false)
              setTimeout(() => setIsFlipped(true), 300)
            }}
          >
            再看一次結果
          </Button>
        </motion.div>
      )}
    </div>
  )
}
