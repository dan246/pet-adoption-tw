import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAllAnimals } from '../hooks/useAnimals'
import PetCard, { PetCardCompact } from '../components/PetCard'
import PetModal from '../components/PetModal'
import FilterBar from '../components/FilterBar'
import { PetCardSkeleton } from '../components/ui/Skeleton'
import { Button, Pagination } from '../components/ui'
import { RefreshCw, Frown } from 'lucide-react'

const ITEMS_PER_PAGE = 24

// Fisher-Yates shuffle with seed for consistent randomization per session
function seededShuffle(array, seed) {
  const shuffled = [...array]
  let currentIndex = shuffled.length

  // Simple seeded random number generator
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

export default function Adopt() {
  const { data: allAnimals, isLoading, isFetching, error, refetch } = useAllAnimals()
  const [filters, setFilters] = useState({})
  const [viewMode, setViewMode] = useState('grid')
  const [selectedAnimal, setSelectedAnimal] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Generate a random seed once per session (stored in sessionStorage)
  const sessionSeed = useRef(() => {
    const stored = sessionStorage.getItem('pet-shuffle-seed')
    if (stored) return parseInt(stored)
    const newSeed = Math.floor(Math.random() * 1000000)
    sessionStorage.setItem('pet-shuffle-seed', newSeed.toString())
    return newSeed
  })

  // Filter and shuffle animals
  const filteredAnimals = useMemo(() => {
    if (!allAnimals) return []

    let result = [...allAnimals]

    if (filters.type) {
      result = result.filter(a => a.animal_kind === filters.type)
    }
    if (filters.city) {
      result = result.filter(a =>
        a.shelter_address?.includes(filters.city) ||
        a.shelter_name?.includes(filters.city)
      )
    }
    if (filters.sex) {
      result = result.filter(a => a.animal_sex === filters.sex)
    }
    if (filters.size) {
      result = result.filter(a => a.animal_bodytype === filters.size)
    }
    if (filters.age) {
      result = result.filter(a => a.animal_age === filters.age)
    }

    // Shuffle the results with session seed
    return seededShuffle(result, sessionSeed.current())
  }, [allAnimals, filters])

  // Calculate pagination
  const totalPages = Math.ceil(filteredAnimals.length / ITEMS_PER_PAGE)

  // Get animals for current page
  const paginatedAnimals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAnimals.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredAnimals, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // Handle page change - scroll to top
  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-2">
              領養專區
            </h1>
            <p className="text-text-secondary">
              用愛給牠們一個家，讓這些毛孩不再流浪
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? '更新中' : '重新整理'}
          </button>
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalCount={filteredAnimals.length}
          />
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Frown className="w-16 h-16 text-text-light mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-text-primary mb-2">
              載入失敗
            </h3>
            <p className="text-text-secondary mb-4">
              無法載入動物資料，請稍後再試
            </p>
            <Button variant="primary" icon={RefreshCw} onClick={() => refetch()}>
              重新載入
            </Button>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'
            : 'space-y-3'
          }>
            {[...Array(12)].map((_, i) => (
              <PetCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredAnimals.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <span className="text-6xl block mb-4">🔍</span>
            <h3 className="text-xl font-display font-bold text-text-primary mb-2">
              找不到符合條件的毛孩
            </h3>
            <p className="text-text-secondary mb-4">
              試試調整篩選條件，或瀏覽全部毛孩
            </p>
            <Button variant="primary" onClick={() => setFilters({})}>
              清除篩選條件
            </Button>
          </motion.div>
        )}

        {/* Animals Grid */}
        {!isLoading && !error && paginatedAnimals.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {paginatedAnimals.map((animal, index) => (
                  <PetCard
                    key={animal.animal_id}
                    animal={animal}
                    index={index}
                    onClick={setSelectedAnimal}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedAnimals.map((animal) => (
                  <PetCardCompact
                    key={animal.animal_id}
                    animal={animal}
                    onClick={setSelectedAnimal}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                siblingCount={2}
              />
              <p className="text-center mt-4 text-sm text-text-light">
                第 {currentPage} 頁，共 {totalPages} 頁（{filteredAnimals.length} 隻毛孩）
              </p>
            </div>
          </>
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
