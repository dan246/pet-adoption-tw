import { motion } from 'framer-motion'
import { Filter, X, Search, Grid, List } from 'lucide-react'
import { useState } from 'react'
import { Select, Button, Badge } from './ui'

const animalTypes = [
  { value: '狗', label: '🐕 狗狗' },
  { value: '貓', label: '🐈 貓咪' },
]

const cities = [
  { value: '臺北市', label: '臺北市' },
  { value: '新北市', label: '新北市' },
  { value: '桃園市', label: '桃園市' },
  { value: '臺中市', label: '臺中市' },
  { value: '臺南市', label: '臺南市' },
  { value: '高雄市', label: '高雄市' },
  { value: '基隆市', label: '基隆市' },
  { value: '新竹市', label: '新竹市' },
  { value: '新竹縣', label: '新竹縣' },
  { value: '苗栗縣', label: '苗栗縣' },
  { value: '彰化縣', label: '彰化縣' },
  { value: '南投縣', label: '南投縣' },
  { value: '雲林縣', label: '雲林縣' },
  { value: '嘉義市', label: '嘉義市' },
  { value: '嘉義縣', label: '嘉義縣' },
  { value: '屏東縣', label: '屏東縣' },
  { value: '宜蘭縣', label: '宜蘭縣' },
  { value: '花蓮縣', label: '花蓮縣' },
  { value: '臺東縣', label: '臺東縣' },
  { value: '澎湖縣', label: '澎湖縣' },
  { value: '金門縣', label: '金門縣' },
  { value: '連江縣', label: '連江縣' },
]

const sexOptions = [
  { value: 'M', label: '♂️ 男生' },
  { value: 'F', label: '♀️ 女生' },
]

const sizeOptions = [
  { value: 'SMALL', label: '小型' },
  { value: 'MEDIUM', label: '中型' },
  { value: 'BIG', label: '大型' },
]

const ageOptions = [
  { value: 'CHILD', label: '幼年' },
  { value: 'ADULT', label: '成年' },
]

export default function FilterBar({
  filters,
  onChange,
  viewMode = 'grid',
  onViewModeChange,
  totalCount,
}) {
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  const handleFilterChange = (key, value) => {
    onChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onChange({})
  }

  return (
    <div className="space-y-4">
      {/* Search & Quick Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Animal Type Quick Filters */}
        <div className="flex gap-2">
          <QuickFilterButton
            active={!filters.type}
            onClick={() => handleFilterChange('type', '')}
          >
            全部
          </QuickFilterButton>
          <QuickFilterButton
            active={filters.type === '狗'}
            onClick={() => handleFilterChange('type', '狗')}
          >
            🐕 狗狗
          </QuickFilterButton>
          <QuickFilterButton
            active={filters.type === '貓'}
            onClick={() => handleFilterChange('type', '貓')}
          >
            🐈 貓咪
          </QuickFilterButton>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* View Toggle */}
        <div className="hidden sm:flex items-center gap-1 bg-warm-beige rounded-full p-1">
          <button
            onClick={() => onViewModeChange?.('grid')}
            className={`p-2 rounded-full transition-all ${
              viewMode === 'grid'
                ? 'bg-white shadow-soft text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange?.('list')}
            className={`p-2 rounded-full transition-all ${
              viewMode === 'list'
                ? 'bg-white shadow-soft text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Toggle (Mobile) */}
        <Button
          variant="ghost"
          size="sm"
          icon={Filter}
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="md:hidden"
        >
          篩選
          {activeFiltersCount > 0 && (
            <Badge variant="primary" size="sm" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:flex flex-wrap items-center gap-3">
        <Select
          options={cities}
          value={filters.city || ''}
          onChange={(v) => handleFilterChange('city', v)}
          placeholder="選擇縣市"
          className="w-40"
        />
        <Select
          options={sexOptions}
          value={filters.sex || ''}
          onChange={(v) => handleFilterChange('sex', v)}
          placeholder="性別"
          className="w-32"
        />
        <Select
          options={sizeOptions}
          value={filters.size || ''}
          onChange={(v) => handleFilterChange('size', v)}
          placeholder="體型"
          className="w-32"
        />
        <Select
          options={ageOptions}
          value={filters.age || ''}
          onChange={(v) => handleFilterChange('age', v)}
          placeholder="年齡"
          className="w-32"
        />

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>
            清除篩選
          </Button>
        )}

        {totalCount !== undefined && (
          <span className="text-sm text-text-secondary ml-auto">
            共 <span className="font-bold text-primary">{totalCount}</span> 隻毛孩等家
          </span>
        )}
      </div>

      {/* Mobile Filters Panel */}
      {showMobileFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white rounded-2xl shadow-soft p-4 space-y-3"
        >
          <Select
            options={cities}
            value={filters.city || ''}
            onChange={(v) => handleFilterChange('city', v)}
            placeholder="選擇縣市"
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              options={sexOptions}
              value={filters.sex || ''}
              onChange={(v) => handleFilterChange('sex', v)}
              placeholder="性別"
            />
            <Select
              options={sizeOptions}
              value={filters.size || ''}
              onChange={(v) => handleFilterChange('size', v)}
              placeholder="體型"
            />
          </div>
          <Select
            options={ageOptions}
            value={filters.age || ''}
            onChange={(v) => handleFilterChange('age', v)}
            placeholder="年齡"
          />
          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="flex-1"
            >
              清除全部
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowMobileFilters(false)}
              className="flex-1"
            >
              套用篩選
            </Button>
          </div>
        </motion.div>
      )}

      {/* Active Filters Tags */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.city && (
            <FilterTag onRemove={() => handleFilterChange('city', '')}>
              {filters.city}
            </FilterTag>
          )}
          {filters.sex && (
            <FilterTag onRemove={() => handleFilterChange('sex', '')}>
              {sexOptions.find(o => o.value === filters.sex)?.label}
            </FilterTag>
          )}
          {filters.size && (
            <FilterTag onRemove={() => handleFilterChange('size', '')}>
              {sizeOptions.find(o => o.value === filters.size)?.label}
            </FilterTag>
          )}
          {filters.age && (
            <FilterTag onRemove={() => handleFilterChange('age', '')}>
              {ageOptions.find(o => o.value === filters.age)?.label}
            </FilterTag>
          )}
        </div>
      )}
    </div>
  )
}

function QuickFilterButton({ active, onClick, children }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-full font-medium transition-all ${
        active
          ? 'bg-primary text-white shadow-glow'
          : 'bg-white text-text-secondary hover:bg-warm-beige'
      }`}
    >
      {children}
    </motion.button>
  )
}

function FilterTag({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
      {children}
      <button
        onClick={onRemove}
        className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}
