import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MapPin, Calendar, Ruler, Info } from 'lucide-react'
import { Badge } from './ui'
import { getProxiedImageUrl } from '../services/api'

const sexLabels = {
  M: '男生',
  F: '女生',
  N: '未知',
}

const sizeLabels = {
  BIG: '大型',
  MEDIUM: '中型',
  SMALL: '小型',
}

const ageLabels = {
  ADULT: '成年',
  CHILD: '幼年',
}

const defaultImage = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop'

export default function PetCard({ animal, onClick, index = 0 }) {
  const imageUrl = getProxiedImageUrl(animal.album_file) || defaultImage
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={() => onClick?.(animal)}
      className="group cursor-pointer bg-white rounded-3xl shadow-soft overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-warm-beige">
        {/* Loading Skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 skeleton" />
        )}

        {/* Placeholder icon while loading */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl opacity-30">
              {animal.animal_kind === '狗' ? '🐕' : '🐈'}
            </span>
          </div>
        )}

        <img
          src={imageError ? defaultImage : imageUrl}
          alt={animal.animal_kind}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true)
            setImageLoaded(true)
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quick Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button className="w-full btn-primary text-sm py-2">
            <Info className="w-4 h-4 inline mr-2" />
            查看詳情
          </button>
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={animal.animal_kind === '狗' ? 'primary' : 'secondary'}>
            {animal.animal_kind === '狗' ? '🐕' : '🐈'} {animal.animal_kind}
          </Badge>
        </div>

        {/* Favorite Button */}
        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation()
            // Add to favorites logic
          }}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-soft hover:shadow-glow transition-all"
        >
          <Heart className="w-5 h-5 text-primary" />
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title & ID */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display font-bold text-lg text-text-primary line-clamp-1">
            {animal.animal_kind === '狗' ? '可愛狗狗' : '可愛貓咪'} #{animal.animal_id}
          </h3>
        </div>

        {/* Traits */}
        <div className="flex flex-wrap gap-2 mb-3">
          {animal.animal_sex && (
            <Badge variant="neutral" size="sm">
              {sexLabels[animal.animal_sex] || animal.animal_sex}
            </Badge>
          )}
          {animal.animal_bodytype && (
            <Badge variant="neutral" size="sm" icon={Ruler}>
              {sizeLabels[animal.animal_bodytype] || animal.animal_bodytype}
            </Badge>
          )}
          {animal.animal_age && (
            <Badge variant="neutral" size="sm" icon={Calendar}>
              {ageLabels[animal.animal_age] || animal.animal_age}
            </Badge>
          )}
        </div>

        {/* Color */}
        {animal.animal_colour && (
          <p className="text-sm text-text-secondary mb-2">
            毛色：{animal.animal_colour}
          </p>
        )}

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-text-light">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="line-clamp-1">
            {animal.shelter_name || animal.shelter_address || '收容所'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export function PetCardCompact({ animal, onClick, matchScore }) {
  const imageUrl = getProxiedImageUrl(animal.album_file) || defaultImage
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => onClick?.(animal)}
      className="flex items-center gap-4 p-3 bg-white rounded-2xl shadow-soft cursor-pointer hover:shadow-soft-lg transition-all"
    >
      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-warm-beige flex-shrink-0">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}
        <img
          src={imageError ? defaultImage : imageUrl}
          alt={animal.animal_kind}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true)
            setImageLoaded(true)
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{animal.animal_kind === '狗' ? '🐕' : '🐈'}</span>
          <span className="font-medium text-text-primary">
            #{animal.animal_id}
          </span>
          {matchScore && (
            <Badge variant="success" size="sm">
              {matchScore}% 匹配
            </Badge>
          )}
        </div>
        <p className="text-sm text-text-secondary line-clamp-1">
          {sexLabels[animal.animal_sex] || ''} · {sizeLabels[animal.animal_bodytype] || ''} · {animal.animal_colour || ''}
        </p>
      </div>
    </motion.div>
  )
}
