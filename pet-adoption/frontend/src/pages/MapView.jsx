import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Filter, List, Map as MapIcon, Search } from 'lucide-react'
import { useShelters, useAllAnimals } from '../hooks/useAnimals'
import MapComponent, { ShelterList } from '../components/Map'
import { Card, Button, Select } from '../components/ui'

const cities = [
  { value: '', label: '全部縣市' },
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

export default function MapView() {
  const { data: shelters = [], isLoading: sheltersLoading } = useShelters()
  const { data: animals = [] } = useAllAnimals()
  const [selectedShelter, setSelectedShelter] = useState(null)
  const [cityFilter, setCityFilter] = useState('')
  const [viewMode, setViewMode] = useState('map') // map, list

  // Calculate animal counts per shelter
  const animalCounts = useMemo(() => {
    const counts = {}
    animals.forEach(animal => {
      const shelterName = animal.shelter_name
      if (shelterName) {
        const shelter = shelters.find(s =>
          s.name === shelterName || shelterName.includes(s.name) || s.name.includes(shelterName)
        )
        if (shelter) {
          counts[shelter.id] = (counts[shelter.id] || 0) + 1
        }
      }
    })
    return counts
  }, [animals, shelters])

  // Filter shelters by city
  const filteredShelters = useMemo(() => {
    if (!cityFilter) return shelters
    return shelters.filter(s => s.city === cityFilter)
  }, [shelters, cityFilter])

  // Total animals in filtered shelters
  const totalAnimals = useMemo(() => {
    return filteredShelters.reduce((sum, shelter) => {
      return sum + (animalCounts[shelter.id] || 0)
    }, 0)
  }, [filteredShelters, animalCounts])

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-2">
            收容所地圖
          </h1>
          <p className="text-text-secondary">
            探索全台 {shelters.length} 個收容所，找到離你最近的毛孩
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* City Filter */}
          <div className="flex-1 min-w-[200px] max-w-xs">
            <Select
              options={cities}
              value={cityFilter}
              onChange={setCityFilter}
              placeholder="選擇縣市"
              icon={MapPin}
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span>
              <strong className="text-primary">{filteredShelters.length}</strong> 個收容所
            </span>
            <span>
              <strong className="text-primary">{totalAnimals}</strong> 隻毛孩
            </span>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-warm-beige rounded-full p-1 ml-auto">
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-full transition-all ${
                viewMode === 'map'
                  ? 'bg-white shadow-soft text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full transition-all ${
                viewMode === 'list'
                  ? 'bg-white shadow-soft text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map / List View */}
          <div className={`${viewMode === 'map' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            {viewMode === 'map' ? (
              <div className="h-[500px] lg:h-[600px]">
                <MapComponent
                  shelters={filteredShelters}
                  selectedShelter={selectedShelter}
                  onShelterSelect={setSelectedShelter}
                  animalCounts={animalCounts}
                />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredShelters.map((shelter) => (
                  <ShelterCard
                    key={shelter.id}
                    shelter={shelter}
                    animalCount={animalCounts[shelter.id] || 0}
                    isSelected={selectedShelter?.id === shelter.id}
                    onClick={() => setSelectedShelter(shelter)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Shelter List (Map View Only) */}
          {viewMode === 'map' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <Card className="p-4">
                <h3 className="font-display font-bold text-text-primary mb-4 flex items-center gap-2">
                  <List className="w-4 h-4" />
                  收容所列表
                </h3>
                <ShelterList
                  shelters={filteredShelters}
                  selectedShelter={selectedShelter}
                  onSelect={setSelectedShelter}
                  animalCounts={animalCounts}
                />
              </Card>
            </motion.div>
          )}
        </div>

        {/* Selected Shelter Info */}
        {selectedShelter && viewMode === 'map' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Card className="p-6 bg-gradient-to-r from-secondary/10 to-primary/10">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-display font-bold text-text-primary mb-2">
                    {selectedShelter.name}
                  </h3>
                  <p className="text-text-secondary mb-2">
                    {selectedShelter.address}
                  </p>
                  <p className="text-sm text-text-light">
                    🐾 目前有 <strong className="text-primary">{animalCounts[selectedShelter.id] || 0}</strong> 隻毛孩等家
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={() => {
                      const address = encodeURIComponent(selectedShelter.address)
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank')
                    }}
                  >
                    導航前往
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function ShelterCard({ shelter, animalCount, isSelected, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`cursor-pointer rounded-2xl p-4 transition-all ${
        isSelected
          ? 'bg-primary/10 border-2 border-primary shadow-glow'
          : 'bg-white border-2 border-transparent shadow-soft hover:shadow-soft-lg'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isSelected ? 'bg-primary text-white' : 'bg-secondary/20 text-secondary-500'
        }`}>
          <MapPin className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium line-clamp-1 ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
            {shelter.name}
          </h4>
          <p className="text-sm text-text-secondary line-clamp-1 mt-1">
            {shelter.city}
          </p>
          {animalCount > 0 && (
            <p className="text-xs text-text-light mt-2">
              🐾 {animalCount} 隻毛孩
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
