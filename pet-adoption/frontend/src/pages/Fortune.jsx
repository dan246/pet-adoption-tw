import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useFortune } from '../hooks/useAnimals'
import FortuneCard from '../components/FortuneCard'
import PetModal from '../components/PetModal'
import { Card, Button } from '../components/ui'
import { Calendar, History, Star } from 'lucide-react'

const FORTUNE_STORAGE_KEY = 'pet-fortune-history'

export default function Fortune() {
  const { data: fortune, isLoading, refetch } = useFortune()
  const [isDrawn, setIsDrawn] = useState(false)
  const [history, setHistory] = useState([])
  const [selectedAnimal, setSelectedAnimal] = useState(null)

  // Check if already drawn today
  useEffect(() => {
    const today = new Date().toDateString()
    const lastDraw = localStorage.getItem('last-fortune-draw')

    if (lastDraw === today) {
      setIsDrawn(true)
    }

    // Load history
    const savedHistory = localStorage.getItem(FORTUNE_STORAGE_KEY)
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to parse fortune history')
      }
    }
  }, [])

  const handleDraw = async () => {
    if (isDrawn) return

    await refetch()

    const today = new Date().toDateString()
    localStorage.setItem('last-fortune-draw', today)
    setIsDrawn(true)

    // Save to history
    if (fortune) {
      const newHistory = [
        {
          date: today,
          fortune: fortune.fortune,
          animalId: fortune.animal?.animal_id,
          animalKind: fortune.animal?.animal_kind,
        },
        ...history.slice(0, 6), // Keep last 7 days
      ]
      setHistory(newHistory)
      localStorage.setItem(FORTUNE_STORAGE_KEY, JSON.stringify(newHistory))
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl block mb-4"
          >
            🎋
          </motion.span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-2">
            每日幸運抽籤
          </h1>
          <p className="text-text-secondary">
            每天一次機會，遇見與你最有緣的毛孩
          </p>
        </div>

        {/* Fortune Card */}
        <FortuneCard
          fortune={fortune}
          onDraw={handleDraw}
          isDrawn={isDrawn}
          isLoading={isLoading}
          onViewAnimal={setSelectedAnimal}
        />

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Card className="p-6 bg-gradient-to-r from-accent/10 to-primary/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-display font-bold text-text-primary mb-2">
                  抽籤小知識
                </h3>
                <ul className="text-text-secondary text-sm space-y-1">
                  <li>• 每天凌晨 00:00 重置抽籤機會</li>
                  <li>• 籤詩結果由系統根據當日運勢隨機產生</li>
                  <li>• 可以把結果分享給朋友，一起來認識這隻毛孩</li>
                  <li>• 如果特別有緣，不妨去收容所看看牠！</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* History */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-text-secondary" />
              <h3 className="font-display font-bold text-text-primary">
                近期抽籤紀錄
              </h3>
            </div>

            <div className="grid gap-3">
              {history.map((record, index) => (
                <Card key={index} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-warm-beige rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-text-light">{record.date}</p>
                      <p className="font-medium text-text-primary">
                        {record.animalKind === '狗' ? '🐕' : '🐈'} #{record.animalId}
                      </p>
                    </div>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: record.fortune.color + '30', color: '#5D5D5D' }}
                  >
                    {record.fortune.type}
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Pet Modal */}
      <PetModal
        animal={selectedAnimal}
        isOpen={!!selectedAnimal}
        onClose={() => setSelectedAnimal(null)}
      />
    </div>
  )
}
