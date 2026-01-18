import { motion } from 'framer-motion'

export default function Card({
  children,
  className = '',
  interactive = false,
  hover = true,
  padding = 'p-6',
  ...props
}) {
  const Component = interactive ? motion.div : 'div'
  const motionProps = interactive
    ? {
        whileHover: hover ? { scale: 1.02, y: -4 } : {},
        whileTap: { scale: 0.98 },
      }
    : {}

  return (
    <Component
      className={`
        bg-white rounded-3xl shadow-soft
        ${hover && !interactive ? 'hover:shadow-soft-lg hover:-translate-y-1' : ''}
        transition-all duration-300 ease-out
        ${padding}
        ${interactive ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  )
}
