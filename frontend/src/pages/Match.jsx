import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RotateCcw, Heart, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAllAnimals } from '../hooks/useAnimals'
import { submitMatch } from '../services/api'
import QuizForm from '../components/QuizForm'
import PetCard from '../components/PetCard'
import PetModal from '../components/PetModal'
import { Card, Button, Badge } from '../components/ui'

export default function Match() {
  const { data: animals } = useAllAnimals()
  const [stage, setStage] = useState('intro') // intro, quiz, result
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAnimal, setSelectedAnimal] = useState(null)

  const handleSubmit = async (answers) => {
    setIsLoading(true)
    try {
      const matchResult = await submitMatch(answers)
      setResult(matchResult)
      setStage('result')
    } catch (error) {
      console.error('Match error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestart = () => {
    setStage('intro')
    setResult(null)
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {/* Intro Stage */}
          {stage === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-8"
              >
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center shadow-glow">
                  <Sparkles className="w-16 h-16 text-white" />
                </div>
              </motion.div>

              <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">
                AI 智慧配對
              </h1>
              <p className="text-lg text-text-secondary mb-8 max-w-lg mx-auto">
                回答 5 個簡單問題，讓我們幫你找到最適合的毛孩夥伴！
                配對結果將根據你的生活型態和偏好來推薦。
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <FeatureTag icon="🏠" text="居住環境分析" />
                <FeatureTag icon="⚡" text="活動量配對" />
                <FeatureTag icon="🎯" text="精準推薦" />
              </div>

              <Button
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => setStage('quiz')}
                className="shadow-glow"
              >
                開始配對測驗
              </Button>
            </motion.div>
          )}

          {/* Quiz Stage */}
          {stage === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <QuizForm onSubmit={handleSubmit} isLoading={isLoading} />
            </motion.div>
          )}

          {/* Result Stage */}
          {stage === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Top Match */}
              <div className="text-center mb-8">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-5xl block mb-4"
                >
                  🎉
                </motion.span>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-text-primary mb-2">
                  配對完成！
                </h2>
                <p className="text-text-secondary">
                  根據你的回答，我們找到了最適合你的毛孩
                </p>
              </div>

              {/* Best Match Card */}
              {result.topMatch && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 via-white to-secondary/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-bold text-lg text-text-primary flex items-center gap-2">
                        <Heart className="w-5 h-5 text-primary fill-primary" />
                        最佳配對
                      </h3>
                      <Badge variant="success" size="lg">
                        {result.topMatch.matchScore}% 匹配
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="aspect-square rounded-2xl overflow-hidden">
                        <img
                          src={result.topMatch.album_file || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop'}
                          alt="最佳配對毛孩"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="text-3xl mb-2">
                          {result.topMatch.animal_kind === '狗' ? '🐕' : '🐈'}
                        </p>
                        <h4 className="text-xl font-display font-bold text-text-primary mb-2">
                          {result.topMatch.animal_kind} #{result.topMatch.animal_id}
                        </h4>
                        <p className="text-text-secondary mb-4">
                          {result.topMatch.animal_colour || '可愛毛色'} ·
                          {result.topMatch.animal_bodytype === 'BIG' ? '大型' :
                           result.topMatch.animal_bodytype === 'MEDIUM' ? '中型' : '小型'}
                        </p>
                        <p className="text-sm text-text-light mb-4">
                          📍 {result.topMatch.shelter_name || '收容所'}
                        </p>
                        <Button
                          variant="primary"
                          icon={Heart}
                          onClick={() => setSelectedAnimal(result.topMatch)}
                        >
                          了解更多
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Other Matches */}
              {result.matches && result.matches.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="font-display font-bold text-lg text-text-primary mb-4">
                    其他推薦
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {result.matches.slice(1, 7).map((animal, index) => (
                      <motion.div
                        key={animal.animal_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <PetCard
                          animal={animal}
                          onClick={setSelectedAnimal}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap justify-center gap-4 mt-8"
              >
                <Button
                  variant="ghost"
                  icon={RotateCcw}
                  onClick={handleRestart}
                >
                  重新測驗
                </Button>
                <Link to="/adopt">
                  <Button variant="outline" icon={ArrowRight} iconPosition="right">
                    瀏覽全部毛孩
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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

function FeatureTag({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-soft text-text-secondary text-sm">
      <span>{icon}</span>
      {text}
    </span>
  )
}
