import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { motion } from 'framer-motion'
import { Navigation, Phone, ExternalLink } from 'lucide-react'
import { Button, Badge } from './ui'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom marker icon
const createCustomIcon = (color = '#FFB4A2') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        border: 3px solid white;
      ">
        <span style="transform: rotate(45deg); font-size: 18px;">🐾</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  })
}

// Component to fly to selected shelter
function FlyToLocation({ position }) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13, { duration: 1 })
    }
  }, [position, map])

  return null
}

export default function MapComponent({
  shelters = [],
  selectedShelter,
  onShelterSelect,
  animalCounts = {},
}) {
  const [mapReady, setMapReady] = useState(false)

  // Taiwan center
  const defaultCenter = [23.5, 121]
  const defaultZoom = 7

  const handleNavigate = (shelter) => {
    const address = encodeURIComponent(shelter.address || shelter.name)
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank')
  }

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-3xl overflow-hidden shadow-soft">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {selectedShelter && (
          <FlyToLocation position={[selectedShelter.lat, selectedShelter.lng]} />
        )}

        {shelters.map((shelter) => {
          const count = animalCounts[shelter.id] || 0
          const isSelected = selectedShelter?.id === shelter.id

          return (
            <Marker
              key={shelter.id}
              position={[shelter.lat, shelter.lng]}
              icon={createCustomIcon(isSelected ? '#B5E2D8' : '#FFB4A2')}
              eventHandlers={{
                click: () => onShelterSelect?.(shelter),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-display font-bold text-text-primary mb-1">
                    {shelter.name}
                  </h3>
                  <p className="text-sm text-text-secondary mb-3">
                    {shelter.address}
                  </p>

                  {count > 0 && (
                    <div className="mb-3">
                      <Badge variant="primary">
                        🐾 {count} 隻毛孩等家
                      </Badge>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Navigation}
                      onClick={() => handleNavigate(shelter)}
                      className="flex-1"
                    >
                      導航
                    </Button>
                    {shelter.tel && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Phone}
                        onClick={() => window.open(`tel:${shelter.tel}`)}
                      >
                        電話
                      </Button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Loading Overlay */}
      {!mapReady && (
        <div className="absolute inset-0 bg-warm-beige flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-text-secondary">載入地圖中...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Shelter List Component
export function ShelterList({ shelters, selectedShelter, onSelect, animalCounts = {} }) {
  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-hide">
      {shelters.map((shelter) => {
        const isSelected = selectedShelter?.id === shelter.id
        const count = animalCounts[shelter.id] || 0

        return (
          <motion.button
            key={shelter.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelect(shelter)}
            className={`w-full p-4 rounded-2xl text-left transition-all ${
              isSelected
                ? 'bg-primary/10 border-2 border-primary'
                : 'bg-white border-2 border-transparent hover:bg-warm-beige'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium line-clamp-1 ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
                  {shelter.name}
                </h4>
                <p className="text-sm text-text-secondary line-clamp-1 mt-1">
                  {shelter.city}
                </p>
              </div>
              {count > 0 && (
                <Badge variant={isSelected ? 'primary' : 'neutral'} size="sm">
                  {count}
                </Badge>
              )}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
