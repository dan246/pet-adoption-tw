import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Activity, Award, Clock, Heart, ChevronRight, ChevronLeft,
  Sparkles, Dog, Cat
} from 'lucide-react'
import { Button, Card } from './ui'

const questions = [
  {
    id: 'space',
    icon: Home,
    question: '你的居住空間有多大？',
    description: '這會影響適合的毛孩體型',
    options: [
      { value: 'large', label: '獨棟/透天', description: '有院子或大陽台', emoji: '🏡' },
      { value: 'medium', label: '一般公寓', description: '有適當活動空間', emoji: '🏢' },
      { value: 'small', label: '小套房', description: '空間較為緊湊', emoji: '🏠' },
    ],
  },
  {
    id: 'activity',
    icon: Activity,
    question: '你的日常活動量如何？',
    description: '找到與你生活節奏相符的毛孩',
    options: [
      { value: 'high', label: '熱愛運動', description: '每天都會外出活動', emoji: '🏃' },
      { value: 'moderate', label: '適度活動', description: '偶爾散步或運動', emoji: '🚶' },
      { value: 'low', label: '宅家一族', description: '偏好在家休息', emoji: '🛋️' },
    ],
  },
  {
    id: 'experience',
    icon: Award,
    question: '你有養過寵物嗎？',
    description: '了解你的照顧經驗',
    options: [
      { value: 'experienced', label: '養過多隻', description: '經驗豐富的飼主', emoji: '🏆' },
      { value: 'some', label: '養過一隻', description: '有基本照顧經驗', emoji: '⭐' },
      { value: 'none', label: '第一次養', description: '新手飼主', emoji: '🌱' },
    ],
  },
  {
    id: 'time',
    icon: Clock,
    question: '你每天可以陪伴毛孩多久？',
    description: '毛孩需要你的愛與陪伴',
    options: [
      { value: 'plenty', label: '很多時間', description: '在家工作或退休', emoji: '💝' },
      { value: 'moderate', label: '適度時間', description: '下班後可以陪伴', emoji: '💕' },
      { value: 'limited', label: '時間有限', description: '工作較為忙碌', emoji: '💼' },
    ],
  },
  {
    id: 'preference',
    icon: Heart,
    question: '你比較喜歡哪種毛孩？',
    description: '或者你都喜歡？',
    options: [
      { value: '狗', label: '狗狗', description: '活潑忠誠的好夥伴', emoji: '🐕' },
      { value: '貓', label: '貓咪', description: '優雅獨立的小可愛', emoji: '🐈' },
      { value: 'any', label: '都喜歡', description: '貓狗我都愛', emoji: '🐾' },
    ],
  },
]

export default function QuizForm({ onSubmit, isLoading }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})

  const currentQuestion = questions[currentStep]
  const isLastStep = currentStep === questions.length - 1
  const progress = ((currentStep + 1) / questions.length) * 100

  const handleSelect = (value) => {
    setAnswers({ ...answers, [currentQuestion.id]: value })

    if (!isLastStep) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    onSubmit(answers)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
          <span>問題 {currentStep + 1} / {questions.length}</span>
          <span>{Math.round(progress)}% 完成</span>
        </div>
        <div className="h-2 bg-warm-beige rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-8">
            {/* Question Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <currentQuestion.icon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-text-primary">
                  {currentQuestion.question}
                </h3>
                <p className="text-text-secondary">
                  {currentQuestion.description}
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.value
                return (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-glow'
                        : 'border-warm-beige hover:border-primary/30 hover:bg-warm-beige/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{option.emoji}</span>
                      <div className="flex-1">
                        <p className={`font-medium ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
                          {option.label}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {option.description}
                        </p>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                        >
                          <span className="text-white text-sm">✓</span>
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="ghost"
          icon={ChevronLeft}
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          上一題
        </Button>

        {isLastStep && answers[currentQuestion.id] ? (
          <Button
            variant="primary"
            icon={Sparkles}
            iconPosition="right"
            onClick={handleSubmit}
            loading={isLoading}
          >
            查看配對結果
          </Button>
        ) : (
          <div className="flex gap-1">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-primary w-6'
                    : index < currentStep
                    ? 'bg-primary/50'
                    : 'bg-warm-beige'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
