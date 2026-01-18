import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Menu, X, Home, Search, Sparkles, Map, Gift } from 'lucide-react'

const navLinks = [
  { path: '/', label: '首頁', icon: Home },
  { path: '/adopt', label: '領養專區', icon: Search },
  { path: '/fortune', label: '每日抽籤', icon: Gift },
  { path: '/match', label: 'AI 配對', icon: Sparkles },
  { path: '/map', label: '收容所地圖', icon: Map },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-glow"
            >
              <Heart className="w-5 h-5 text-white fill-white" />
            </motion.div>
            <span className="text-xl font-display font-bold text-text-primary">
              浪浪找家
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className={`relative px-4 py-2 rounded-full font-medium transition-all duration-200
                    ${isActive
                      ? 'text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-full hover:bg-primary/10 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden glass border-t border-white/20"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all
                      ${isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:bg-warm-beige'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
