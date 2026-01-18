import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Heart, Search, Sparkles, Map, Gift, ArrowRight,
  Dog, Cat, Users, Building2
} from 'lucide-react'
import { useStats, useAllAnimals } from '../hooks/useAnimals'
import PetCard from '../components/PetCard'
import PetModal from '../components/PetModal'
import { Button, Card } from '../components/ui'
import { PetCardSkeleton } from '../components/ui/Skeleton'
import { useState, useMemo, useRef } from 'react'

// Fisher-Yates shuffle with seed
function seededShuffle(array, seed) {
  const shuffled = [...array]
  let currentIndex = shuffled.length
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  while (currentIndex > 0) {
    const randomIndex = Math.floor(seededRandom() * currentIndex)
    currentIndex--
    ;[shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]]
  }
  return shuffled
}

const features = [
  {
    icon: Search,
    title: '智慧搜尋',
    description: '多維度篩選，快速找到心儀毛孩',
    color: 'primary',
    link: '/adopt',
  },
  {
    icon: Gift,
    title: '每日抽籤',
    description: '每天一次機會，遇見命中注定的牠',
    color: 'accent',
    link: '/fortune',
  },
  {
    icon: Sparkles,
    title: 'AI 配對',
    description: '回答問卷，找到最適合你的毛孩',
    color: 'secondary',
    link: '/match',
  },
  {
    icon: Map,
    title: '收容所地圖',
    description: '一目瞭然全台收容所位置',
    color: 'primary',
    link: '/map',
  },
]

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useStats()
  const { data: animals, isLoading: animalsLoading } = useAllAnimals()
  const [selectedAnimal, setSelectedAnimal] = useState(null)

  // Generate a random seed once per session
  const sessionSeed = useRef(() => {
    const stored = sessionStorage.getItem('pet-shuffle-seed')
    if (stored) return parseInt(stored)
    const newSeed = Math.floor(Math.random() * 1000000)
    sessionStorage.setItem('pet-shuffle-seed', newSeed.toString())
    return newSeed
  })

  // Get featured animals (with images) - shuffled randomly
  const featuredAnimals = useMemo(() => {
    if (!animals) return []
    const withImages = animals.filter(a => a.album_file)
    const shuffled = seededShuffle(withImages, sessionSeed.current())
    return shuffled.slice(0, 8)
  }, [animals])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24">
        {/* Background decorations */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-text-primary leading-tight mb-6">
                讓每個毛孩
                <br />
                <span className="text-primary">都找到溫暖的家</span>
              </h1>
              <p className="text-lg md:text-xl text-text-secondary mb-8 max-w-lg">
                我們串接全台收容所資料，透過 AI 智慧配對，
                幫助你找到最適合的毛孩夥伴。
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/adopt">
                  <Button size="lg" icon={Search}>
                    開始找毛孩
                  </Button>
                </Link>
                <Link to="/match">
                  <Button size="lg" variant="outline" icon={Sparkles}>
                    AI 配對測驗
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                {/* Main image */}
                <div className="w-full aspect-square max-w-lg mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=600&h=600&fit=crop"
                    alt="可愛的狗狗"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-soft-lg p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🐕</span>
                    <div>
                      <p className="text-sm text-text-light">狗狗</p>
                      <p className="font-bold text-primary">{stats?.dogs || '---'}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-soft-lg p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🐈</span>
                    <div>
                      <p className="text-sm text-text-light">貓咪</p>
                      <p className="font-bold text-secondary-500">{stats?.cats || '---'}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              icon={<span className="text-3xl">🐾</span>}
              value={stats?.total || '---'}
              label="等家毛孩"
              loading={statsLoading}
            />
            <StatCard
              icon={<Dog className="w-8 h-8 text-primary" />}
              value={stats?.dogs || '---'}
              label="狗狗"
              loading={statsLoading}
            />
            <StatCard
              icon={<Cat className="w-8 h-8 text-secondary-500" />}
              value={stats?.cats || '---'}
              label="貓咪"
              loading={statsLoading}
            />
            <StatCard
              icon={<Building2 className="w-8 h-8 text-accent-500" />}
              value={stats?.shelters || '---'}
              label="收容所"
              loading={statsLoading}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">我們的特色</h2>
            <p className="section-subtitle">
              用科技的力量，幫助更多毛孩被看見
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={feature.link}>
                  <Card interactive className="h-full text-center group">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-${feature.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`w-8 h-8 text-${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-display font-bold text-text-primary mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-text-secondary text-sm">
                      {feature.description}
                    </p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Pets Section */}
      <section className="py-16 bg-gradient-to-b from-white/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">精選毛孩</h2>
              <p className="text-text-secondary">
                這些可愛的毛孩正在等待你的愛
              </p>
            </div>
            <Link to="/adopt">
              <Button variant="ghost" icon={ArrowRight} iconPosition="right">
                查看全部
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {animalsLoading ? (
              [...Array(8)].map((_, i) => <PetCardSkeleton key={i} />)
            ) : (
              featuredAnimals.map((animal, index) => (
                <PetCard
                  key={animal.animal_id}
                  animal={animal}
                  index={index}
                  onClick={setSelectedAnimal}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 via-white to-secondary/10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-5xl mb-4 block">🎋</span>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-text-primary mb-4">
                試試今日運勢抽籤
              </h2>
              <p className="text-text-secondary mb-6 max-w-lg mx-auto">
                每天一次機會，抽取你的幸運毛孩！
                也許命中注定的牠，就在今天出現。
              </p>
              <Link to="/fortune">
                <Button size="lg" icon={Gift} className="shadow-glow">
                  開始抽籤
                </Button>
              </Link>
            </motion.div>
          </Card>
        </div>
      </section>

      {/* Pet Modal */}
      <PetModal
        animal={selectedAnimal}
        isOpen={!!selectedAnimal}
        onClose={() => setSelectedAnimal(null)}
      />
    </div>
  )
}

function StatCard({ icon, value, label, loading }) {
  return (
    <Card className="text-center py-6">
      <div className="flex justify-center mb-2">{icon}</div>
      {loading ? (
        <div className="h-8 w-16 mx-auto skeleton rounded mb-1" />
      ) : (
        <p className="text-2xl md:text-3xl font-bold text-text-primary">{value}</p>
      )}
      <p className="text-sm text-text-secondary">{label}</p>
    </Card>
  )
}
