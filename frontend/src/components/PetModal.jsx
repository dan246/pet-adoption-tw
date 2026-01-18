import { motion } from 'framer-motion'
import {
  X, Heart, Share2, MapPin, Phone, Calendar, Ruler,
  Info, ExternalLink, Navigation, Copy, Check
} from 'lucide-react'
import { useState } from 'react'
import { Modal, Badge, Button } from './ui'
import { getProxiedImageUrl } from '../services/api'

const sexLabels = { M: '男生', F: '女生', N: '未知' }
const sizeLabels = { BIG: '大型', MEDIUM: '中型', SMALL: '小型' }
const ageLabels = { ADULT: '成年', CHILD: '幼年' }
const sterilizedLabels = { T: '已絕育', F: '未絕育', N: '未知' }
const bacterinLabels = { T: '已施打', F: '未施打', N: '未知' }

const defaultImage = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop'

export default function PetModal({ animal, isOpen, onClose }) {
  const [copied, setCopied] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  if (!animal) return null

  const imageUrl = getProxiedImageUrl(animal.album_file) || defaultImage

  const handleShare = async () => {
    const shareData = {
      title: `浪浪找家 - ${animal.animal_kind} #${animal.animal_id}`,
      text: `我在浪浪找家發現了一隻可愛的${animal.animal_kind}！快來看看吧！`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleNavigate = () => {
    const address = encodeURIComponent(animal.shelter_address || animal.shelter_name)
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showClose={false}>
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="relative md:w-1/2 bg-warm-beige">
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton flex items-center justify-center">
              <span className="text-6xl opacity-30">
                {animal.animal_kind === '狗' ? '🐕' : '🐈'}
              </span>
            </div>
          )}
          <img
            src={imageError ? defaultImage : imageUrl}
            alt={animal.animal_kind}
            loading="eager"
            decoding="async"
            className={`w-full h-64 md:h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true)
              setImageLoaded(true)
            }}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-soft hover:shadow-glow transition-all"
          >
            <X className="w-5 h-5 text-text-primary" />
          </button>

          {/* Type Badge */}
          <div className="absolute top-4 left-4">
            <Badge variant={animal.animal_kind === '狗' ? 'primary' : 'secondary'} size="lg">
              {animal.animal_kind === '狗' ? '🐕' : '🐈'} {animal.animal_kind}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-soft transition-all ${
                isFavorite ? 'bg-primary text-white' : 'bg-white/90 backdrop-blur-sm text-primary'
              }`}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-soft hover:shadow-glow transition-all"
            >
              {copied ? <Check className="w-6 h-6 text-green-500" /> : <Share2 className="w-6 h-6 text-text-primary" />}
            </motion.button>
          </div>
        </div>

        {/* Info Section */}
        <div className="md:w-1/2 p-6 overflow-y-auto max-h-[70vh]">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
              {animal.animal_kind === '狗' ? '可愛狗狗' : '可愛貓咪'} #{animal.animal_id}
            </h2>
            <p className="text-text-secondary">
              {animal.animal_remark || '等待一個溫暖的家'}
            </p>
          </div>

          {/* Traits Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <InfoItem
              icon={<span className="text-xl">{animal.animal_sex === 'M' ? '♂️' : '♀️'}</span>}
              label="性別"
              value={sexLabels[animal.animal_sex] || '未知'}
            />
            <InfoItem
              icon={<Ruler className="w-5 h-5 text-primary" />}
              label="體型"
              value={sizeLabels[animal.animal_bodytype] || '未知'}
            />
            <InfoItem
              icon={<Calendar className="w-5 h-5 text-primary" />}
              label="年齡"
              value={ageLabels[animal.animal_age] || '未知'}
            />
            <InfoItem
              icon={<span className="text-lg">🎨</span>}
              label="毛色"
              value={animal.animal_colour || '未知'}
            />
          </div>

          {/* Health Info */}
          <div className="bg-warm-beige/50 rounded-2xl p-4 mb-6">
            <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              健康狀況
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant={animal.animal_sterilization === 'T' ? 'success' : 'neutral'}>
                {sterilizedLabels[animal.animal_sterilization] || '絕育狀態未知'}
              </Badge>
              <Badge variant={animal.animal_bacterin === 'T' ? 'success' : 'neutral'}>
                狂犬病疫苗 {bacterinLabels[animal.animal_bacterin] || '未知'}
              </Badge>
            </div>
          </div>

          {/* Shelter Info */}
          <div className="bg-secondary/10 rounded-2xl p-4 mb-6">
            <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              收容所資訊
            </h3>
            <p className="text-text-primary font-medium mb-1">
              {animal.shelter_name || '收容所'}
            </p>
            <p className="text-sm text-text-secondary mb-3">
              {animal.shelter_address || '地址未提供'}
            </p>
            {animal.shelter_tel && (
              <a
                href={`tel:${animal.shelter_tel}`}
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Phone className="w-4 h-4" />
                {animal.shelter_tel}
              </a>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              className="flex-1"
              icon={Phone}
              onClick={() => window.open(`tel:${animal.shelter_tel}`)}
            >
              聯繫收容所
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              icon={Navigation}
              onClick={handleNavigate}
            >
              導航前往
            </Button>
          </div>

          {/* External Link */}
          {animal.animal_opendate && (
            <p className="mt-4 text-center text-sm text-text-light">
              開放認養日期：{animal.animal_opendate}
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-warm-beige/30 rounded-xl">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-text-light">{label}</p>
        <p className="font-medium text-text-primary">{value}</p>
      </div>
    </div>
  )
}
